import { Wish } from './entities/wish.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(user: User, createWishDto: CreateWishDto) {
    return await this.wishRepository.save({
      ...createWishDto,
      owner: user,
    });
  }

  find(query) {
    return this.wishRepository.find(query);
  }

  getLastWishes() {
    return this.wishRepository.find({ order: { createdAt: 'DESC' }, take: 40 });
  }

  getTopWishes() {
    return this.wishRepository.find({ order: { copied: 'DESC' }, take: 10 });
  }

  async findById(id: number) {
    const wish = await this.wishRepository.findOne({
      where: { id: id },
      relations: ['owner', 'offers'],
    });

    if (wish) {
      return wish;
    }

    throw new NotFoundException('Подарка с таким id не существует');
  }

  async update(userId: number, wishId: number, updateWishDto: UpdateWishDto) {
    const wish = await this.findById(wishId);
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Нельзя изменять чужие подарки');
    }

    if (+wish.raised > 0 && +wish.price !== +updateWishDto.price) {
      throw new ForbiddenException(
        'Нельзя изменять стоимость подарка, если уже есть желающие скинуться',
      );
    }

    await this.wishRepository.update(wishId, updateWishDto);
    const updateWish = await this.findById(wishId);
    return updateWish;
  }

  async remove(userId: number, wishId: number) {
    const wish = await this.findById(wishId);
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Нельзя удалять чужие подарки');
    }
    await this.wishRepository.delete(wishId);
    return wish;
  }

  async copy(user: User, wishId: number) {
    const wish = await this.findById(wishId);
    const hasCopy = !!(await this.wishRepository.findOne({
      where: {
        name: wish.name,
        link: wish.link,
        price: wish.price,
        owner: { id: user.id },
      },
      relations: { owner: true },
    }));

    if (hasCopy) {
      throw new ForbiddenException('Вы уже копировали себе этот подарок');
    }

    await this.wishRepository.update(wishId, { copied: ++wish.copied });
    delete wish.id;
    delete wish.createdAt;
    delete wish.updatedAt;
    wish.copied = 0;
    return this.create(user, wish);
  }
}
