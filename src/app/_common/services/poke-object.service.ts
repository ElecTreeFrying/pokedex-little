import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PokeObjectService {

  constructor(
    private http: HttpClient
  ) { }

  abilities(_abilities: any) {
    return _abilities.map((ability) => {
          
      ability['ability']['data'] = this.http.get(ability['ability']['url']).pipe(
        map((ability) => {
          
          const effect_entry = ability['effect_entries'].filter(e => e.language.name === 'en')[0];
          delete effect_entry['language'];
          
          let flavor_text_entry = ability['flavor_text_entries'].filter(e => e.language.name === 'en')
            .filter(e => e.language.name === 'en')
            .map((entry: any) => {
              entry['language'] = entry['language']['name'];
              entry['flavor_text'] = entry['flavor_text'].replace(/\n/g, ' ');
              entry['id'] = +entry['version_group']['url'].split('/').reverse()[1];
              entry['version_group'] = entry['version_group']['name'];
              entry['version'] = 'Pokémon ' + this.versionGroupPretty(entry['version_group']);

              delete entry['language'];
              return entry;
            });
          
            flavor_text_entry = _.sortBy(flavor_text_entry, [ 'id' ]);

          return { effect_entry, flavor_text_entry };
        })
      );

      delete ability['ability']['url'];
      delete ability['is_hidden'];

      return ability;
    });
  }

  moves(_moves: any) {
    return _moves.map((move) => {
          
      // move
      move['move']['data'] = this.http.get(move['move']['url']).pipe(
        map((res) => {
          
          // accuracy
          const accuracy = res['accuracy'];
          
          // contest type
          let contest_type = null;
          if (res['contest_type']) {
            contest_type = res['contest_type']['name'];
          }
          
          // contest effect
          let contest_effect = null;
          if (res['contest_effect']) {
            contest_effect = this.http.get(res['contest_effect']['url']).pipe(
              map((contest) => {
                const effect_entry = contest['effect_entries'].filter(e => e.language.name === 'en')[0];
                let flavor_text_entry = contest['flavor_text_entries'].filter(e => e.language.name === 'en')[0];
                return { effect_entry, flavor_text_entry };
              })
            );
          }              

          // damage class
          const damage_class = this.http.get(res['damage_class']['url']).pipe(
            map((damage) => {
              const description = damage['descriptions'].filter(e => e.language.name === 'en')[0];
              const name = damage['name'];
              return { description, name };
            })
          );

          // effect entry
          const effect_entry = res['effect_entries'].filter(e => e.language.name === 'en')[0];

          // flavor entry
          let flavor_text_entry = res['flavor_text_entries']
            .filter(e => e.language.name === 'en')
            .map((entry: any) => {
              entry['language'] = entry['language']['name'];
              entry['flavor_text'] = entry['flavor_text'].replace(/\n/g, ' ');
              entry['id'] = +entry['version_group']['url'].split('/').reverse()[1];
              entry['version_group'] = entry['version_group']['name'];
              entry['version'] = 'Pokémon ' + this.versionGroupPretty(entry['version_group']);

              delete entry['language'];
              return entry;
            });
          
          flavor_text_entry = _.sortBy(flavor_text_entry, [ 'id' ]);
          

          // meta
          res['meta']['ailment'] = res['meta']['ailment']['name'];
          res['meta']['category']['description'] = this.http.get(res['meta']['category']['url']).pipe(
            map((category) => category['descriptions'].filter(e => e.language.name === 'en')[0].description)
          );
          
          delete res['meta']['max_hits'];
          delete res['meta']['max_turns'];
          delete res['meta']['min_hits'];
          delete res['meta']['min_turns'];
          delete res['meta']['category']['url']

          const meta = res['meta'];
          
          // name 
          const name = res['name'];
          
          // foreign names
          const foreign = res['names'].map((name) => {
            name['language'] = name['language']['name'];
            return name;
          });
          
          // power 
          const power = res['power'];

          // name 
          const pp = res['pp'];

          // super contest effect

          let super_contest_effect = null;
          if (res['super_contest_effect']) {
            super_contest_effect = this.http.get(res['super_contest_effect']['url']).pipe(
              map((contest) => {
                let flavor_text_entry = contest['flavor_text_entries'].filter(e => e.language.name === 'en')[0];
                delete flavor_text_entry['language'];
                return { flavor_text_entry };
              })
            );
          }

          // target
          const target = this.http.get(res['target']['url']).pipe(
            map((target) => {
              const name = target['name'];
              const description = target['descriptions'].filter(e => e.language.name === 'en')[0].description;
              return { name, description };
            })
          )

          // type
          const type = res['type']['name'];

          return { accuracy, contest_type, contest_effect, damage_class, effect_entry, flavor_text_entry, meta, name, foreign, power, pp, super_contest_effect, target, type };
        })
      );

      delete move['move']['url']

      // version group details          
      move['version_group_details'] = move['version_group_details'].map((version) => {
        
        version['move_learn_method']['data'] = this.http.get(version['move_learn_method']['url']).pipe(
          map((learnMethod) => {
            const description = learnMethod['descriptions'].filter(e => e.language.name === 'en')[0].description;
            const name = learnMethod['name'];
            return { name, description }
          })
        )

        delete version['version_group']
        delete version['move_learn_method']['url'];

        return version;
      })

      return move;
    });
  }

  species(_species: any) {
    return  this.http.get(_species['url']).pipe(
      map((specie) => {
        
        specie['color'] = specie['color']['name'];

        specie['egg_groups'] = specie['egg_groups'].map((group) => {
          delete group['url'];
          return group;
        })

        specie['evolution_chain'] = this.http.get(specie['evolution_chain']['url']).pipe(
          map((chain) => {

            let first = null;
            if (chain['chain']['evolves_to'].length > 0) {
              first = {
                name: chain['chain']['species']['name'],
                evolution: chain['chain']['evolves_to'][0]['species']['name'],
                pokemon: chain['chain']['evolves_to'][0],
                entry_number: +chain['chain']['species']['url'].split('/').reverse()[1]
              }
            } else {
              first = {
                name: chain['chain']['species']['name'],
                evolution: null, pokemon: null,
                entry_number: +chain['chain']['species']['url'].split('/').reverse()[1]
              }
            }
            
            let second = null;
            if (first['pokemon']['evolves_to'].length > 0) {
              second = {
                name: first['pokemon']['species']['name'],
                evolution: first['pokemon']['evolves_to'][0]['species']['name'],
                pokemon: first['pokemon']['evolves_to'][0],
                entry_number: +first['pokemon']['species']['url'].split('/').reverse()[1]
              }
            } else {
              second = {
                name: first['pokemon']['species']['name'],
                evolution: null, pokemon: null,
                entry_number: +first['pokemon']['species']['url'].split('/').reverse()[1]
              }
            }
            
            let third = null;
            if (second['pokemon']['evolves_to'].length > 0) {
              third = {
                name: second['pokemon']['species']['name'],
                evolution: second['pokemon']['evolves_to'][0]['species']['name'],
                pokemon: second['pokemon']['evolves_to'][0],
                entry_number: +second['pokemon']['species']['url'].split('/').reverse()[1]
              }
            } else {
              third = {
                name: second['pokemon']['species']['name'],
                evolution: null, pokemon: null,
                entry_number: +second['pokemon']['species']['url'].split('/').reverse()[1]
              }
            }

            delete first['pokemon'];
            delete second['pokemon'];
            delete third['pokemon'];
            
            return { first, second, third };
          })
        )

        specie['flavor_text_entries'] = specie['flavor_text_entries']
          .filter(e => e['language']['name'] === 'en')
          .map((entry: any) => {
            entry['language'] = entry['language']['name'];
            entry['flavor_text'] = entry['flavor_text'].replace(/\n/g, ' ');
            entry['id'] = +entry['version']['url'].split('/').reverse()[1];
            entry['version_group'] = entry['version']['name'];
            entry['version'] = 'Pokémon ' + this.versionGroupPretty(entry['version']['name']);
            
            delete entry['language'];
            return entry;
          });
      
        specie['flavor_text_entries'] = _.sortBy(specie['flavor_text_entries'], [ 'id' ])

        specie['genera'] = specie['genera'].filter(e => e.language.name === 'en')[0].genus;
        
        specie['growth_rate'] = this.http.get(specie['growth_rate']['url']).pipe(
          map((growth) => {
            
            growth['description'] = growth['descriptions'].filter(e => e.language.name === 'en')[0].description;

            delete growth['descriptions'];
            delete growth['formula'];
            delete growth['id'];
            delete growth['pokemon_species'];
            
            return growth;
          })
        )
        
        specie['habitat'] = specie['habitat']['name'];

        specie['pokedex_numbers'] = specie['pokedex_numbers'].map((pokedex) => {
          const name = pokedex['pokedex']['name'].split('-').join(' ');
          pokedex['pokedex'] = name.split(' ').map((a: string) => 
            a[0].toUpperCase() + a.slice(1)).join(' ');
          return pokedex;
        })

        specie['shape'] = specie['shape']['name'];

        delete specie['evolves_from_species'];
        delete specie['form_descriptions'];
        delete specie['forms_switchable'];
        delete specie['generation'];
        delete specie['has_gender_differences'];
        delete specie['id'];
        delete specie['is_baby'];
        delete specie['name'];
        delete specie['names'];
        delete specie['order'];
        delete specie['pal_park_encounters'];
        delete specie['varieties'];

        return specie;
      })
    );
  }

  private versionGroupPretty(group: string) {
    return group.replace('red-blue', 'red-and-blue')
      .replace('gold-silver', 'gold-and-silver')
      .replace('ruby-sapphire', 'ruby-and-sapphire')
      .replace('firered-leafgreen', 'fire-red-and-leafy-green')
      .replace('diamond-pearl', 'diamond-and-pearl')
      .replace('heartgold-soulsilver', 'heart-gold-and-soul-silver')
      .replace('black-white', 'black-and-white')
      .replace('black-2-white-2', 'black-2-and-white-2')
      .replace('x-y', 'x-and-y')
      .replace('omega-ruby-alpha-sapphire', 'omega-ruby-and-alpha-sapphire')
      .replace('sun-moon', 'sun-and-moon')
      .replace('ultra-sun-ultra-moon', 'ultra-sun-and-ultra-moon')
      .split('-')
      .map((a: string) => a[0].toUpperCase() + a.slice(1))
      .join(' ').replace('And', 'and') + ' Version';
  }

}
