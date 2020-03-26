import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from 'nativescript-angular/router';
import * as app from "tns-core-modules/application";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";

import { PokeApiService } from "../../_common/services/poke-api.service";

@Component({
  selector: 'ns-berries',
  templateUrl: './berries.component.html',
  styleUrls: ['./berries.component.scss']
})
export class BerriesComponent implements OnInit {

  berries: any;

  constructor(
    private router: RouterExtensions,
    private api: PokeApiService
  ) { }
  
  ngOnInit(): void {
    this.berries = this.api.berriesData;

    this.berries.subscribe((res) => {
      this.navigate(res[0]);
    });
  }

  navigate(item: any) {
    this.api.id = item['id'];
    this.router.navigate(['berry-data']);
  }

  onShow() {
    const drawer = <RadSideDrawer>app.getRootView();
    drawer.showDrawer();
  }
  
}