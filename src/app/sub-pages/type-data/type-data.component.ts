import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { ActivatedRoute } from '@angular/router';
import { AnimationCurve } from 'tns-core-modules/ui/enums';

import { TypeObjectService } from "../../_common/services/type-object.service";

@Component({
  selector: 'ns-type-data',
  templateUrl: './type-data.component.html',
  styleUrls: ['./type-data.component.scss']
})
export class TypeDataComponent implements OnInit {

  types: any;

  constructor(
    public router: RouterExtensions,
    private route: ActivatedRoute,
    private object: TypeObjectService
  ) { }

  ngOnInit(): void {
    this.types = this.route.snapshot.data['resolve'];
    this.types['name'] = this.object.name(this.types['name']);
    this.types['pokemon'] = this.object.pokemon(this.types['pokemon']);
  }

  toPokemon(pokemon: any) {
    console.log('pokemon selected →', pokemon);
  }

  back() {
    this.router.navigate(['pokemon'], {
      animated: true,
      transition: {
        name: 'slideRight',
        curve: AnimationCurve.cubicBezier(1,0,.5,1),
        duration: 500
      }
    });
  }

}
