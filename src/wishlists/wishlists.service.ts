import { WishesService } from 'src/wishes/wishes.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishService: WishesService,
  ) {}

  async create(user, createWishlistDto: CreateWishlistDto) {
    const wishes = await this.wishService.find({
      where: { id: In(createWishlistDto.itemsId) },
    });
    const wishlist = await this.wishlistRepository.save({
      ...createWishlistDto,
      owner: user,
      items: wishes,
    });
    const { itemsId, ...rest } = wishlist;
    return rest;
  }

  //check
  async findAll() {
    return await this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });
  }

  //check
  async findById(id: number) {
    const wishlist = await this.wishlistRepository.find({
      relations: ['owner', 'items'],
      where: { id: id },
    });

    if (wishlist.length !== 0) {
      return wishlist;
    }
    throw new NotFoundException('Списка желаний c таким id не существует');
  }

  //check
  async update(
    userId: number,
    wishlistId: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.findById(wishlistId);
    if (userId !== wishlist[0].owner.id) {
      throw new ForbiddenException(
        'Редактировать можно только свои подборки подарков',
      );
    }
    return this.wishlistRepository.update(wishlistId, updateWishlistDto);
  }

  //check
  async remove(userId: number, wishlistId: number) {
    const wishlist = await this.findById(wishlistId);
    if (userId !== wishlist[0].owner.id) {
      throw new ForbiddenException(
        'Удалять можно только свои подборки подарков',
      );
    }
    await this.wishlistRepository.delete(wishlistId);
    return wishlist;
  }
}
