import { Controller, Get, Put, Body } from "@nestjs/common";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  @Put()
  async update(@Body() body: Record<string, any>) {
    return this.settingsService.setMany(body);
  }
}
