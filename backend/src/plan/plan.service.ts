import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  async findAllAdmin() {
    return this.prisma.plan.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { subscriptions: true } } },
    });
  }

  async findById(id: number) {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.plan.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.plan.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.plan.delete({ where: { id } });
  }
}
