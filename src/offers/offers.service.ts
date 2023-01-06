import { Offer } from './entities/offer.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WishesService } from 'src/wishes/wishes.service';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    private readonly wishService: WishesService,
  ) {}

  async create(user, createOfferDto: CreateOfferDto) {
    const wish = await this.wishRepository.findOne({
      where: { id: createOfferDto.itemId },
      relations: ['owner'],
    });
    if (user.id === wish.owner.id) {
      throw new ForbiddenException(
        'Нельзя вносить деньги на собственные подарки',
      );
    }

    if (+wish.raised === +wish.price) {
      throw new ForbiddenException(
        'Нельзя скинуться на подарки, на которые уже собраны деньги',
      );
    }

    if (+wish.price - +wish.raised < createOfferDto.amount) {
      throw new ForbiddenException(
        'Сумма собранных средств не может превышать стоимость подарка',
      );
    }

    wish.raised = +wish.raised + createOfferDto.amount;
    await this.wishRepository.update(wish.id, wish);

    return this.offerRepository.save({
      ...createOfferDto,
      item: wish,
      user: user,
    });
  }

  findAll() {
    return this.offerRepository.find({
      relations: {
        item: true,
        user: true,
      },
    });
  }

  async findById(id: number) {
    const offer = await this.offerRepository.findOne({
      where: { id: id },
      relations: ['user', 'item'],
    });

    return offer;
  }
}
