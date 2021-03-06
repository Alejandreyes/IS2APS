import { Component, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AccionService } from '../../../servicios/accion.service';
import { Router } from '@angular/router';
import {Accion} from '../../../modelos/accion.model';
@Component({
  selector: 'app-agregar-accion',
  templateUrl: './agregar-accion.component.html',
  styleUrls: ['./agregar-accion.component.css']
})
export class AgregarAccionComponent implements OnInit {
  accionForm: FormGroup;
  constructor(private fb: FormBuilder,
    private accionServ: AccionService,
    public router: Router) {
  }

  ngOnInit() {
    window.history.replaceState({} , "","/accion") ;
    this.accionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(15)]]
    });
  }
  onSubmit() {
    const accion = new Accion();
    accion.nombre = this.accionForm.value.nombre;
    accion.descripcion = this.accionForm.value.descripcion;
    this.accionServ.addAccion(accion);
  }
  onCancel() {
    this.router.navigate(['/accion']);
  }
}
