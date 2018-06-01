import { Component, OnInit, EventEmitter } from '@angular/core';
//import {FlujoEvento} from '../../../modelos/FlujoEventos';
import { CasoUso } from '../../../modelos/casouso.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CasosUsoService } from '../../../servicios/casos-uso.service';
import { AccionService } from '../../../servicios/accion.service';
import { Router } from '@angular/router';
import { MaterializeAction } from 'angular2-materialize';
import { Actividad } from '../../../modelos/actividad.model';
@Component({
  selector: 'app-agregar-caso',
  templateUrl: './agregar-caso.component.html',
  styleUrls: ['./agregar-caso.component.css']
})
export class AgregarCasoComponent implements OnInit {
  chipsActions = new EventEmitter<string | MaterializeAction>();
  precondiciones: string[] = [];
  postcondiciones: string[] = [];


  modalActions = new EventEmitter<string | MaterializeAction>();

  requisitosEspeciales: string[] = [];
  actores: string[] = [];
  chipsPlaceholder = {
    placeholder: '+Ingresa Campo',
    secondaryPlaceholder: 'Ingresa un nuevo campo',
  };

 // acciones =[ {accion:"Gato", eventos : this.provincias},  {accion:"Perro", eventos : this.provincias},  {accion:"Pollo", eventos : this.provincias}];
  acciones = []; 

 //a  = new FlujoEvento() ;

  selecionado: string;
  casoUsoForm: FormGroup;
  constructor(private fb: FormBuilder,
    private casoServ: CasosUsoService,
    private accionServ: AccionService,
    public router: Router) {
  }

  ngOnInit() {
    this.casoUsoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      actores: [[], Validators.required]
    });
    this.accionServ.getAcciones().valueChanges().subscribe(item =>{
      item.forEach(valores =>{
        this.acciones.push(valores.nombre);

      }); 
       
    });
     
  }
  add(chip, nombreLista: string) {
    switch (nombreLista) {
      case 'precondiciones':
        this.precondiciones.push(chip.tag);
        break;
      case 'postcondiciones':
        this.postcondiciones.push(chip.tag);
        break;

      case 'requisitosEspeciales':
        this.requisitosEspeciales.push(chip.tag);
        break;
      case 'actores':
        this.actores.push(chip.tag);
        this.casoUsoForm.controls['actores'].patchValue(this.actores);
        break;
    }

  }

  delete(chip, nombreLista: string) {
    switch (nombreLista) {
      case 'precondiciones':
        this.precondiciones = this.precondiciones.filter(item => { return item != chip.tag });
        break;
      case 'postcondiciones':
        this.postcondiciones = this.precondiciones.filter(item => { return item != chip.tag });
        break;

      case 'requisitosEspeciales':
        this.requisitosEspeciales = this.requisitosEspeciales.filter(item => { return item != chip.tag });
        break;
      case 'actores':
        this.actores = this.actores.filter(item => { return item != chip.tag });
        this.casoUsoForm.controls['actores'].patchValue(this.actores);
        break;
    }

  }

  onSubmit() {
    const casoUso = new CasoUso();
    casoUso.nombre = this.casoUsoForm.value.nombre;
    casoUso.descripcion = this.casoUsoForm.value.descripcion;
//<<<<<<< HEAD
    casoUso.precondiciones = this.precondiciones; 
    casoUso.postcondiciones  = this.postcondiciones;
    //casoUso.eventos = this.eventos ; 
    //casoUso.flujos = this.flujos; 
    casoUso.requisitosEspeciales = this.requisitosEspeciales; 
//=======
    // casoUso.precondiciones = this.precondiciones;
    // casoUso.postcondiciones = this.postcondiciones;
    // casoUso.requisitosEspeciales = this.requisitosEspeciales;
//>>>>>>> master
    casoUso.actores = this.actores;
    this.casoServ.addCasoUso(casoUso);
  }
  onCancel() {
    this.router.navigate(['/casosDeUso']);
  }

  openModal() {
    this.modalActions.emit({ action: "modal", params: ['open'] });
  }

  closeModal() {
    this.modalActions.emit({ action: "modal", params: ['close'] });
    console.log(this.selecionado);
  }
}
