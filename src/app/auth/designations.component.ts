import { SigninComponent } from './signin.component';
import { Component, OnInit } from "@angular/core";
import { AuthService } from "./auth.service";
import { User } from "./user.model";
import { Congregation } from "../setup/congregation.model";
import { Circuito } from "../setup/circuito.model";
import { switchMap } from 'rxjs/operators';
import { pipe } from 'rxjs';


@Component({
    selector: 'app-designations',
    templateUrl: './designations.component.html',
    styleUrls: ['./designations.component.css']
})
export class DesignationsComponent implements OnInit{
    escala = [];
    congregations: Congregation[] = [];
    circuitos: Circuito[] = [];
    showNow = false;
    userId = localStorage.getItem('userId');
    obj = [];
    msgdefault = false;

    constructor(private authService: AuthService ) { }

    ngOnInit() {


   this.authService.getPerfilEscala()
   .subscribe(
     (escala) => {
         console.log(escala);

         escala.sort(function(a,b){
          return (a.data > b.data) ? 1 : (a.data < b.data) ? -1 : 0;
         });

       this.authService.getLedsDesignations()
       .subscribe(
         (leds) => {
             console.log(leds);
         for(let i=0;i<escala.length;i++){

           for(let p=0;p<escala[i].pontos.length;p++){
             for(let u=0;u<escala[i].pontos[p].length;u++){
                 let achei = false;
               for(let s=0;s<escala[i].pontos[p][u].npubs;s++){
                 if(escala[i].pontos[p][u].pubs[s] == null ||
                    escala[i].pontos[p][u].pubs[s] == undefined){
                   escala[i].pontos[p][u].pubs[s] = new User();
                 }else{

                let led = leds.find((a)=>{
                  if(a.iduser == escala[i].pontos[p][u].pubs[s].userId &&
                     a.idescala == escala[i]._id &&
                     a.horacode == escala[i].hora[p].code)return true;

                    });

                  if (led != undefined){
                    escala[i].pontos[p][u].pubs[s].sim = led.sim;
                    escala[i].pontos[p][u].pubs[s].nao = led.nao;
                  }

                  if (led != undefined && led.lock) {
                    escala[i].pontos[p][u].pubs[s] = led.sub;
                  }

                  }


                 if (escala[i].pontos[p][u].pubs[s].userId == this.userId){
                    //  pontouserid.push(escala[i].pontos[p][u].id);
                    let type = false;
                    if(escala[i].pontos[p][u].pubs[s].tipoesc == 'S' ||
                    escala[i].pontos[p][u].pubs[s].sim == true ||
                    escala[i].pontos[p][u].pubs[s].nao == true )type = true;
                    this.escala.push({
                      _id: escala[i]._id,
                      dia: escala[i].dia,
                      diasemana: escala[i].diasemana,
                      ponto: escala[i].pontos[p][u].name,
                      type: type,
                      grupo: this.designEscala(escala[i].pontos[p][u].pubs[s], escala[i].pontos[p][u], escala[i])});
                    console.log(this.escala);
                 }


                }
              }
            }
          }


          if(this.escala.length <= 0)this.msgdefault = true;



         this.authService.getCircuito()
         .subscribe(
           (

             circuitos: Circuito[]) => {
             this.circuitos = circuitos;
           });



         this.authService.getCongregation()
         .subscribe(
           (

             congregations: Congregation[]) => {
             this.congregations = congregations;
             let congsort = this.congregations;
             congsort.sort((a, b) => {
               if (a.circuit < b.circuit) return -1;
               if (a.circuit > b.circuit) return 1;

               return 0;
             });
             congsort.sort((a, b) => {
               if (a.circuit == b.circuit) {
                 if (a.nome < b.nome) return -1;
                 if (a.nome > b.nome) return 1;
               }
               return 0;
             });
             this.congregations = congsort;
             this.showNow = true;

           });

    },
  error => console.error(error)
  );

},
error => console.error(error)
);

    }

    getStyle(sex: string) {

        if (sex == 'M') return "blue";
        if (sex == 'F') return "#FF4081";

      }


  responseYes(esc,grupo){

    let horacode;
    let iduser = this.userId;
    let idescala = esc._id;
    let indexpub;
    let conjuge;
    let indexConjuge;

    for(let a=0;a<grupo.length;a++){

    for(let s=0;s<grupo[a].ponto.npubs;s++){
      if (grupo[a].ponto.pubs[s].userId == this.userId){
        grupo[a].ponto.pubs[s].sim = true;
        grupo[a].ponto.pubs[s].nao = false;
        if(grupo[a].ponto.pubs[s].conjuge){ 
          conjuge = grupo[a].ponto.pubs[s].conjuge;
          indexConjuge = grupo[a].ponto.pubs.findIndex(x => x.userId == conjuge);
        }
       esc.type = false;
       horacode = grupo[a].hora.code;
       indexpub = s;
       break;
      }
    }

  }
    let obj = {
      idescala: idescala,
      iduser: iduser,
      horacode: horacode,
      indexpub: indexpub,
      sim: true,
      nao: false

     }

     if(conjuge && indexConjuge > -1){
      this.authService.ledUpdate(obj)
        .pipe(
          switchMap(
          data => this.authService.ledUpdate(obj)
          )).subscribe( data => console.log(data),
            error =>
            {
              if (error.title == "Respondido pelo Telegram!")this.rebuild();
             else {
              console.log(error);
              for(let a=0;a<grupo.length;a++){

                for(let s=0;s<grupo[a].ponto.npubs;s++){
                if (grupo[a].ponto.pubs[s].userId == this.userId){

                  esc.type = false;
                  grupo[a].ponto.pubs[s].sim = false;
                  grupo[a].ponto.pubs[s].nao = false;


                }
              }
            }
          }
            console.error(error)
            }
            );
          }else{
            this.authService.ledUpdate(obj)
            .subscribe( data => console.log(data),
              error => {
                if (error.title == 'Respondido pelo Telegram!') this.rebuild();
                else {
                  console.log(error);
                  for (let a = 0; a < grupo.length; a++) {
      
                    for (let s = 0; s < grupo[a].ponto.npubs; s++) {
                      if (grupo[a].ponto.pubs[s].userId == this.userId) {
      
                        esc.type = false;
                        grupo[a].ponto.pubs[s].sim = false;
                        grupo[a].ponto.pubs[s].nao = false;
      
      
                      }
                    }
                  }
                }
                console.error(error);
              }
            );  
          }



  }

  responseNot(esc,grupo){

    let horacode;
    let iduser = this.userId;
    let idescala = esc._id;
    let indexpub;
    let conjuge;
    let indexConjuge;

    for(let a=0;a<grupo.length;a++){

      for(let s=0;s<grupo[a].ponto.npubs;s++){
        if (grupo[a].ponto.pubs[s].userId == this.userId){
          grupo[a].ponto.pubs[s].sim = false;
          grupo[a].ponto.pubs[s].nao = true;
          if(grupo[a].ponto.pubs[s].conjuge){ 
            conjuge = grupo[a].ponto.pubs[s].conjuge;
            indexConjuge = grupo[a].ponto.pubs.findIndex(x => x.userId == conjuge);
          }
          esc.type = true;
          horacode = grupo[a].hora.code;
          indexpub = s;
          break;
        }
      }

    }


    let obj = {
      idescala: idescala,
      iduser: iduser,
      horacode: horacode,
      indexpub: indexpub,
      sim: false,
      nao: true,

     }
     if(conjuge && indexConjuge > -1){
      this.authService.ledUpdate(obj)
      .pipe(
      switchMap(data => this.authService.ledUpdate(obj)
      )).subscribe(
        data => {
          console.log(data);

        },
        error => {

          if (error.title == 'Respondido pelo Telegram!') this.rebuild();
          else {
            console.log(error);
            for (let a = 0; a < grupo.length; a++) {

              for (let s = 0; s < grupo[a].ponto.npubs; s++) {
                if (grupo[a].ponto.pubs[s].userId == this.userId) {
                  esc.type = false;
                  grupo[a].ponto.pubs[s].sim = false;
                  grupo[a].ponto.pubs[s].nao = false;

                }
              }

            }
          }

          console.error(error);
        }
      );

    }else{
    this.authService.ledUpdate(obj)
            .subscribe(
            data => {
                console.log(data);

               },
            error => {

             if (error.title == "Respondido pelo Telegram!")this.rebuild();
else{
              console.log(error);
              for(let a=0;a<grupo.length;a++){

                for(let s=0;s<grupo[a].ponto.npubs;s++){
                  if (grupo[a].ponto.pubs[s].userId == this.userId){
                    esc.type = false;
                    grupo[a].ponto.pubs[s].sim = false;
                    grupo[a].ponto.pubs[s].nao = false;

                  }
                }

              }
            }

            console.error(error)
              }
            );



  }

  }


  designEscala(pub, ponto, escala) {
    let newdesign = []
    for (let p = 0; p < escala.pontos.length; p++) {

      for (let u = 0; u < escala.pontos[p].length; u++) {

        if (escala.pontos[p][u].id == ponto.id) {
          console.log("pontoigual", escala.pontos[p][u].id, ponto.id);
          let corpo = { hora: escala.hora[p],
                        ponto: escala.pontos[p][u],

          }
          newdesign.push(corpo);
          console.log(corpo);

        }
      }
    }




    return newdesign.slice();


}





rebuild() {
  let escala_aux = [];
  this.authService.getPerfilEscala()
  .subscribe(
    (escala) => {
        console.log(escala);

        escala.sort(function(a,b){
         return (a.data > b.data) ? 1 : (a.data < b.data) ? -1 : 0;
        });

      this.authService.getLedsDesignations()
      .subscribe(
        (leds) => {
            console.log(leds);
        for(let i=0;i<escala.length;i++){

          for(let p=0;p<escala[i].pontos.length;p++){
            for(let u=0;u<escala[i].pontos[p].length;u++){
                let achei = false;
              for(let s=0;s<escala[i].pontos[p][u].npubs;s++){
                if(escala[i].pontos[p][u].pubs[s] == null ||
                   escala[i].pontos[p][u].pubs[s] == undefined){
                  escala[i].pontos[p][u].pubs[s] = new User();
                }else{

               let led = leds.find((a)=>{
                 if(a.iduser == escala[i].pontos[p][u].pubs[s].userId &&
                    a.idescala == escala[i]._id &&
                    a.horacode == escala[i].hora[p].code)return true;

                   });

                 if (led != undefined){
                   escala[i].pontos[p][u].pubs[s].sim = led.sim;
                   escala[i].pontos[p][u].pubs[s].nao = led.nao;
                 }

                 if (led != undefined && led.lock) {
                   escala[i].pontos[p][u].pubs[s] = led.sub;
                 }

                 }


                if (escala[i].pontos[p][u].pubs[s].userId == this.userId){

                   let type = false;
                   if(escala[i].pontos[p][u].pubs[s].tipoesc == 'S' ||
                   escala[i].pontos[p][u].pubs[s].sim == true ||
                   escala[i].pontos[p][u].pubs[s].nao == true )type = true;
                   escala_aux.push({
                     _id: escala[i]._id,
                     dia: escala[i].dia,
                     diasemana: escala[i].diasemana,
                     ponto: escala[i].pontos[p][u].name,
                     type: type,
                     grupo: this.designEscala(escala[i].pontos[p][u].pubs[s], escala[i].pontos[p][u], escala[i])});
                   console.log(escala_aux);
                }


               }
             }
           }
         }


         if(escala_aux.length <= 0){this.msgdefault = true;
        }else{
           this.escala = escala_aux;
           this.msgdefault = false;

         }




      },
      error => console.error(error)
      );

    },
    error => console.error(error)
    );


    }




}
