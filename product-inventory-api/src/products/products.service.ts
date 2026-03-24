import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Products } from './entities/products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { PartialUpdateProductDto } from './dto/partial-update-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private productsRepo: Repository<Products>,
  ) {}

  async create(dto: CreateProductDto) {
    const product = await this.productsRepo.save(dto);
    return { message: 'Product created', data: product };
  }

  async findAll() {
    const data = await this.productsRepo.find({
      order: { createdAt: 'DESC' },
    });
    return { message: 'All products', count: data.length, data };
  }

  async findOne(id: number) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return { message: 'Product found', data: product };
  }

  async update(id: number, dto: PartialUpdateProductDto) {
    await this.findOne(id);
    await this.productsRepo.update(id, dto);
    return this.findOne(id);
  }

  async replace(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    await this.productsRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.productsRepo.delete(id);
    return { message: 'Deleted', id };
  }

  async findByCategory(category: string) {
    const data = await this.productsRepo.find({ where: { category } });
    return { message: 'Filtered', count: data.length, data };
  }

  async search(keyword: string) {
    const data = await this.productsRepo.find({
      where: { name: ILike(`%${keyword}%`) },
    });
    return { message: 'Search result', count: data.length, data };
  }

  async toggleActive(id: number) {
    const product = await this.findOne(id);
    product.data.isActive = !product.data.isActive;
    await this.productsRepo.save(product.data);
    return { message: 'Toggled', data: product.data };
  }
}