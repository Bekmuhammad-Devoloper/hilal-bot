import { Controller, Get, Post, Put, Delete, Body, Param } from "@nestjs/common";
import { PlanService } from "./plan.service";

@Controller("plans")
export class PlanController {
  constructor(private planService: PlanService) {}

  @Get()
  async findAll() {
    return this.planService.findAll();
  }

  @Get("admin")
  async findAllAdmin() {
    return this.planService.findAllAdmin();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.planService.findById(parseInt(id));
  }

  @Post()
  async create(@Body() body: any) {
    return this.planService.create(body);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: any) {
    return this.planService.update(parseInt(id), body);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.planService.delete(parseInt(id));
  }
}
