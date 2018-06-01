import { Component, OnInit, EventEmitter } from '@angular/core';
import { Evento } from '../../modelos/evento.model';
import { EventoPrincipalService } from '../../servicios/evento-principal.service';
import { Router } from '@angular/router';
import { MaterializeAction, MaterializeDirective } from 'angular2-materialize';
import { ActividadPrincipalService } from '../../servicios/actividad-principal.service';

@Component({
    selector:'app-evento-principal',
    templateUrl: './evento-principal.component.html',
    styleUrls: ['./evento-principal.component.css']
})

export class EventoPrincipalComponent implements OnInit {
    listaEventos: Evento[];
    modalActions = new EventEmitter<string | MaterializeAction>();

    constructor(private actividadServ: ActividadPrincipalService,
        private eventoServ: EventoPrincipalService,
        public router: Router){}

    ngOnInit(): void {
        console.log("Actividad seleccionada:");
        console.log(this.actividadServ.actividadSeleccionada);
        this.listaEventos  
            = this.eventoServ.getEventos(this.actividadServ.actividadSeleccionada);
        console.log("Lista eventos:");
        console.log(this.listaEventos);
    }

    onCreate(){
        this.router.navigate(['/agregarEventoPrincipal']);
    }
    
    onEdit(evento: Evento){
        this.eventoServ.eventoSeleccionado = evento;;
        this.router.navigate(['/editarEventoPrincipal']);
    }

    onDelete(evento: Evento){
        this.eventoServ.eventoSeleccionado = evento;
        this.modalActions.emit({ action: 'modal', params: ['open'] });
    }

    closeModal(){
        this.modalActions.emit({ action: 'modal', params: ['close'] });
    }

    eliminar(){
        this.eventoServ.delete(this.eventoServ.eventoSeleccionado);
        
    }
}