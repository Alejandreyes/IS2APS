import { Component, OnInit, group } from '@angular/core';
import * as go from 'gojs';
import { CasosUsoService } from '../../servicios/casos-uso.service';
import { Router } from '@angular/router';

import { toast } from 'angular2-materialize';
import { CasoUso } from '../../modelos/casouso.model';
import { AuxiliarGrafica } from '../../modelos/auxiliarGrafica.model';
declare var jsPDF;
@Component({
  selector: 'app-generar-reporte',
  templateUrl: './generar-reporte.component.html',
  styleUrls: ['./generar-reporte.component.css']
})
export class GenerarReporteComponent implements OnInit {
  respuesta: boolean;
  diagramaImg: any;
  diagramaImg2: any;
  diagram;
  diagram2;
  casoUso: CasoUso;
  constructor(private casoServ: CasosUsoService,
    public router: Router) {
  }
  /**
   * Configuracion de Contruccion de la grafica
   * 
   */
  ngOnInit(): void {

    // Inicia Caso de Uso 
    this.iniciaCasoUso();

    let $ = go.GraphObject.make;
    // Configuracion mas basica para que funcione el diagramador
    // this.diagram = //new go.Diagram("myDiagramDiv");
    // Funcion avanzada para colocar el diagrama en el centro. Ya teniendo esto entonces podemos continuar
    this.diagram =
      $(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
        {
          initialContentAlignment: go.Spot.Center,  // center the content
          "undoManager.isEnabled": false  // enable undo & redo
        });
    // define the node template
    this.diagram.nodeTemplate =
      $(go.Node, "Auto",
        new go.Binding("location", "loc"),
        {
          locationSpot: go.Spot.Center,
        },
        $(go.Shape, "RoundedRectangle",
          {
            name: "OBJSHAPE",
            fill: "white"
          }),
        $(go.TextBlock,
          {
            maxSize: new go.Size(100, NaN),
            wrap: go.TextBlock.WrapFit,
            margin: 10
          },
          new go.Binding("text", "key"))
      );
    this.diagram.groupTemplate =
      $(go.Group, "Spot",
        {
          selectionAdornmentTemplate: // adornment when a group is selected
            $(go.Adornment, "Auto",
              $(go.Shape, "Rectangle",
                { fill: null, stroke: "dodgerblue", strokeWidth: 3 }),
              $(go.Placeholder)
            ),
          toSpot: go.Spot.AllSides, // links coming into groups at any side
          toEndSegmentLength: 100, fromEndSegmentLength: 30
        },
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle",
            {
              name: "OBJSHAPE",
              parameter1: 14,
              fill: "rgba(0,255,0,0.3)"
            },
            new go.Binding("desiredSize", "ds")),
          $(go.Placeholder,
            { padding: 16 })
        ),
        $(go.TextBlock,
          {
            name: "GROUPTEXT",
            alignment: go.Spot.TopLeft,
            alignmentFocus: new go.Spot(0, 0, 4, 4),
            font: "Bold 10pt Sans-Serif"
          },
          new go.Binding("text", "key")),
      );
    // add nodes, including groups, and links to the model
    let aristas = [  // link data
    ];

    let listaAux = [];
    let listaActores = [];

    if (this.casoUso.actividadesPrincipales == undefined) {
      toast("El caso de uso Selecionado no tiene definido Flujo de Eventos Principal", 2500);
      toast("Llene un flujo de Eventos Principal", 2500);
      toast("Seleccione otro caso de uso", 2500);
      this.router.navigate(['/casosDeUso']);
    } else {
      this.casoUso.actividadesPrincipales.forEach(element => {
        listaAux.push(element.nombre);
        if (element.eventos != undefined) {
          if (element.eventos[0].actor == "Actor" || element.eventos[0].actor == "Sistema") {
            listaActores.push(element.eventos[0].actor.trim());
          } else {
            listaActores.push("Actor");
          }
        } else {
          listaActores.push("Actor");
        }

      });
      let Datos = listaAux;
      let inicioA: number = 35;
      let inicioS: number = 35;
      let sistema = false;
      let posXA = 50;
      let posXS = 250;
      let i: number = 0;
      let indiceActores = 0;
      let vertices: AuxiliarGrafica[] = [];

      let auxG = new AuxiliarGrafica();
      auxG.key = "Start";
      auxG.group = "Actor";
      auxG.loc = new go.Point(posXA, inicioA);
      vertices.push(auxG);
      auxG = new AuxiliarGrafica();
      auxG.key = "Flujo Principal";
      auxG.isGroup = true;
      vertices.push(auxG);
      auxG = new AuxiliarGrafica();
      auxG.key = "Actor";
      auxG.isGroup = true;
      auxG.group = "Flujo Principal";
      vertices.push(auxG);
      auxG = new AuxiliarGrafica();
      auxG.key = "Sistema";
      auxG.isGroup = true;
      auxG.group = "Flujo Principal";
      vertices.push(auxG);

      let numActores: number = 0;
      let numSistema: number = 0;

      let ultimoAgregado: string;
      Datos.forEach(element => {
        let aux = { key: "", group: "", loc: null };
        aux.key = element;
        sistema = (listaActores[indiceActores] == "Sistema");
        if (sistema == false) {
          if (i == 0) {
            inicioA += 75;
            inicioS += 75;
            i++;
            ultimoAgregado = "Start";
          }
          aux.group = "Actor";
          aux.loc = new go.Point(posXA, inicioA);
          inicioA += 75;
          
          numActores++;
        } else {
          if (i == 0) {
            if (vertices[0].group != undefined || vertices[0].loc != undefined) {
              vertices[0].group = "Sistema";
              vertices[0].loc = new go.Point(posXS, inicioS);
            }
            inicioA += 75;
            inicioS += 75;
            i++;
            ultimoAgregado = "Start";
          }
          aux.group = "Sistema";
          aux.loc = new go.Point(posXS, inicioS);
          inicioS += 75;
          numSistema++;
        }
        vertices.push(aux);
        aristas.push({ from: ultimoAgregado, to: element });
        ultimoAgregado = element;
        if (i == Datos.length) {
          let final = { key: "Finish", group: (sistema) ? "Sistema" : "Actor", loc: null };
          final.loc = new go.Point((sistema) ? posXS : posXA, (sistema) ? inicioS : inicioA);
          vertices.push(final);
          aristas.push({ from: element, to: "Finish" });
        }
        i++;
        indiceActores++;
      });

      if (numActores == 0) {
        vertices.splice(2, 1);
      }
      if (numSistema == 0) {
        vertices.splice(3, 1);
      }
      this.diagram.model = new go.GraphLinksModel(
        vertices, aristas
      );
      this.diagramaImg = this.diagram.makeImage();
      let src = document.getElementById("myD");
      src.appendChild(this.diagramaImg);
      document.getElementById("myDiagramDiv").style.display = "none";
    }

    this.respuesta = this.agregarGraficaFlujoAlterno();
  }

  iniciaCasoUso() {
    this.casoUso = this.casoServ.casoSeleccionado;
  }


  agregarGraficaFlujoAlterno(): boolean {
    let $ = go.GraphObject.make;
    // Configuracion mas basica para que funcione el diagramador
    // this.diagram = //new go.Diagram("myDiagramDiv");
    // Funcion avanzada para colocar el diagrama en el centro. Ya teniendo esto entonces podemos continuar
    this.diagram2 =
      $(go.Diagram, "myDiagramDiv2",  // create a Diagram for the DIV HTML element
        {
          initialContentAlignment: go.Spot.Center,  // center the content
          "undoManager.isEnabled": false  // enable undo & redo
        });
    // define the node template
    this.diagram2.nodeTemplate =
      $(go.Node, "Auto",
        new go.Binding("location", "loc"),
        {
          locationSpot: go.Spot.Center,
        },
        $(go.Shape, "RoundedRectangle",
          {
            name: "OBJSHAPE",
            fill: "white"
          }),
        $(go.TextBlock,
          {
            maxSize: new go.Size(100, NaN),
            wrap: go.TextBlock.WrapFit,
            margin: 10
          },
          new go.Binding("text", "key"))
      );
    this.diagram2.groupTemplate =
      $(go.Group, "Spot",
        {
          selectionAdornmentTemplate: // adornment when a group is selected
            $(go.Adornment, "Auto",
              $(go.Shape, "Rectangle",
                { fill: null, stroke: "dodgerblue", strokeWidth: 3 }),
              $(go.Placeholder)
            ),
          toSpot: go.Spot.AllSides, // links coming into groups at any side
          toEndSegmentLength: 100, fromEndSegmentLength: 30
        },
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle",
            {
              name: "OBJSHAPE",
              parameter1: 14,
              fill: "rgba(0,255,0,0.3)"
            },
            new go.Binding("desiredSize", "ds")),
          $(go.Placeholder,
            { padding: 16 })
        ),
        $(go.TextBlock,
          {
            name: "GROUPTEXT",
            alignment: go.Spot.TopLeft,
            alignmentFocus: new go.Spot(0, 0, 4, 4),
            font: "Bold 10pt Sans-Serif"
          },
          new go.Binding("text", "key")),
      );
    // add nodes, including groups, and links to the model
    let aristas = [  // link data
    ];

    let listaAux = [];
    let listaActores = [];

    if (this.casoUso.actividadesAlternativas == undefined) {
      document.getElementById("myD2").style.display = "none";
      document.getElementById("myDiagramDiv2").style.display = "none";
      return false;
    } else {
      this.casoUso.actividadesAlternativas.forEach(element => {
        listaAux.push(element.nombre);
        if (element.eventos != undefined) {
          if (element.eventos[0].actor == "Actor" || element.eventos[0].actor == "Sistema") {
            listaActores.push(element.eventos[0].actor.trim());
          } else {
            listaActores.push("Actor");
          }
        } else {
          listaActores.push("Actor");
        }
      });
      let Datos = listaAux;
      let inicioA: number = 35;
      let inicioS: number = 35;
      let sistema = false;
      let posXA = 50;
      let posXS = 250;
      let i: number = 0;
      let indiceActores = 0;
      /* let vertices  = [ // node data
        { key: "Start", group: "Actor", loc: new go.Point(posXA, inicioA) },
        { key: "Diagrama de Flujo de Eventos Alternativos", isGroup: true },
        { key: "Actor", isGroup: true, group: "Diagrama de Flujo de Eventos Alternativos" },
        { key: "Sistema", isGroup: true, group: "Diagrama de Flujo de Eventos Alternativos" }
      ]; */
      let vertices: AuxiliarGrafica[] = [];

      let auxG = new AuxiliarGrafica();
      auxG.key = "Start";
      auxG.group = "Actor";
      auxG.loc = new go.Point(posXA, inicioA);
      vertices.push(auxG);
      auxG = new AuxiliarGrafica();
      auxG.key = "Flujo Alternativos";
      auxG.isGroup = true;
      vertices.push(auxG);
      auxG = new AuxiliarGrafica();
      auxG.key = "Actor";
      auxG.isGroup = true;
      auxG.group = "Flujo Alternativos";
      vertices.push(auxG);
      auxG = new AuxiliarGrafica();
      auxG.key = "Sistema";
      auxG.isGroup = true;
      auxG.group = "Flujo Alternativos";
      vertices.push(auxG);

      let numActores: number = 0;
      let numSistema: number = 0;

      let ultimoAgregado: string;
      Datos.forEach(element => {
        //let aux = { key: "", group: "", loc: null };
        let aux = new AuxiliarGrafica();
        aux.key = element;
        sistema = (listaActores[indiceActores] == "Sistema");
        if (sistema == false) {
          if (i == 0) {
            inicioA += 75;
            inicioS += 75;
            i++;
            ultimoAgregado = "Start";
          }
          aux.group = "Actor";
          aux.loc = new go.Point(posXA, inicioA);
          inicioA += 75;
          numActores++;
        } else {
          if (i == 0) {
            if (vertices[0].group != undefined || vertices[0].loc != undefined) {
              vertices[0].group = "Sistema";
              vertices[0].loc = new go.Point(posXS, inicioS);
            }
            inicioA += 75;
            inicioS += 75;
            i++;
            ultimoAgregado = "Start";
          }
          aux.group = "Sistema";
          aux.loc = new go.Point(posXS, inicioS);
          inicioS += 75;
          numSistema++;
        }
        vertices.push(aux);
        aristas.push({ from: ultimoAgregado, to: element });
        ultimoAgregado = element;
        if (i == Datos.length) {
          let final = { key: "Finish", group: (sistema) ? "Sistema" : "Actor", loc: null };
          final.loc = new go.Point((sistema) ? posXS : posXA, (sistema) ? inicioS : inicioA);
          vertices.push(final);
          aristas.push({ from: element, to: "Finish" });
        }
        i++;
        indiceActores++;
      });
      if (numActores == 0) {
        vertices.splice(2, 1);
      }
      if (numSistema == 0) {
        vertices.splice(3, 1);
      }
      this.diagram2.model = new go.GraphLinksModel(
        vertices, aristas
      );
      this.diagramaImg2 = this.diagram2.makeImage();
      let src = document.getElementById("myD2");
      src.appendChild(this.diagramaImg2);
      document.getElementById("myDiagramDiv2").style.display = "none";
    }
    return true;
  }
  descargar() {
    var columns = ["Indice", "Eventos"];
    var rows = [];
    var auxRows = this.casoUso.precondiciones;
    if (auxRows == undefined) {
      auxRows = [];
      auxRows.push("N/A");
    }
    let indice = 0;
    auxRows.forEach(item => {
      let aux = [indice.toString()];
      aux.push(item);
      rows.push(aux);
      indice++;
    });
    var doc = new jsPDF('p', 'px');;
    var canvas = doc.canvas;
    var ctx = canvas.getContext("2d");
    var y = 20;
    ctx.font = '20px Verdana';
    let aux = "Caso de Uso : " + this.casoServ.casoSeleccionado.nombre;
    doc.text(aux, 30, 22);
    y += 20;
    aux = "Proyecto : " + this.casoServ.nombreProyecto;
    doc.text(aux, 14, y);
    y += 20;
    ctx.font = '12px Verdana';
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    var height = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    let texto = "Descripcion del Caso de Uso: " + this.casoServ.casoSeleccionado.descripcion;
    var text = doc.splitTextToSize(texto, pageWidth - 35);
    text.forEach(element => {
      doc.text(element, 14, y);
      y += 12;
      if (y + 12 > height) {
        doc.addPage();
        y = 20;
      }
    });
    ctx.font = '16px Verdana';
    texto = "Actores: " + this.casoServ.casoSeleccionado.actores.toString();
    doc.text(texto, 14, y);
    y += 16;
    doc.text("Diagrama de Actividad del Flujo Principal de Eventos", 14, y);
    if (y + 300 > height) {
      doc.addPage();
      y = 20;
    }
    doc.addImage(this.diagramaImg, 'JPEG', 10, y, 300, 300);
    y += 300;
    if (y + 24 > height) {
      doc.addPage();
      y = 20;
    }
    columns = ["Indice", "Actor", "Actividad", "Descripcion", "Grupo de Datos"];
    rows = [];

    let auxActividades = this.casoUso.actividadesPrincipales;
    if (auxActividades == undefined) {
      auxRows = [];
      auxRows.push("N/A");
    }
    indice = 0;
    auxActividades.forEach(item => {
      let eventos = item.eventos;
      eventos.forEach(element => {
        let aux = [indice.toString()];
        aux.push(element.actor);
        aux.push(item.nombre);
        aux.push(element.descripcion);
        aux.push(element.grupoDeDatos);
        //Agregamos a la columna de la fila 
        rows.push(aux);
        indice++;
      });
    });
    doc.text("Tabla de Flujo de Actividades Principales", 14, y);
    y += 16;
    doc.autoTable(columns, rows, {
      startY: y,
      margin: { horizontal: 10 },
      bodyStyles: { valign: 'top' },
      styles: { overflow: 'linebreak' },
      columnStyles: {
        0: { columnWidth: 30 },
        1: { columnWidth: 40 },
        2: { columnWidth: 60 },
        text: { columnWidth: 'wrap' }
      }
    });
    doc.addPage();
    y = 20;
    // Nueva hoja para las Precondiciones, postcondiciones y condiciones Iniciales 
    if (this.respuesta) {
      doc.text("Diagrama de Actividad del Flujo Alternativo de Eventos", 14, y);
      doc.addImage(this.diagramaImg2, 'JPEG', 10, y, 300, 300);
      y += 300;
      columns = ["Indice", "Actor", "Actividad", "Descripcion", "Grupo de Datos"];
      rows = [];
      let auxActividades = this.casoUso.actividadesAlternativas;
      if (auxActividades == undefined || auxRows.length == 0) {
        auxRows.push("N/A");
      }
      indice = 0;
      auxActividades.forEach(item => {
        let eventos = item.eventos;
        eventos.forEach(element => {
          let aux = [indice.toString()];
          aux.push(element.actor);
          aux.push(item.nombre);
          aux.push(element.descripcion);
          aux.push(element.grupoDeDatos);
          //Agregamos a la columna de la fila 
          rows.push(aux);
          indice++;
        });
      });
      doc.text("Tabla de Flujo de Actividades Alternativas", 14, y);
      y += 16;
      doc.autoTable(columns, rows, {
        startY: y,
        margin: { horizontal: 10 },
        bodyStyles: { valign: 'top' },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          0: { columnWidth: 30 },
          1: { columnWidth: 40 },
          2: { columnWidth: 60 },
          text: { columnWidth: 'wrap' }
        }
      });
      y = doc.autoTable.previous.finalY + 20;
    }
    ctx.font = '16px Verdana';
    doc.text("Tabla de Precondiciones", 14, y);
    y += 16;
    columns = ["Indice", "Precondiciones"];
    rows = [];
    auxRows = this.casoUso.precondiciones;
    if (auxRows == undefined) {
      auxRows = [];
      auxRows.push("N/A");
    }
    indice = 0;
    auxRows.forEach(item => {
      let aux = [indice.toString()];
      aux.push(item);
      rows.push(aux);
      indice++;
    });
    doc.autoTable(columns, rows, {
      startY: y,
      columnStyles: { text: { columnWidth: 'auto' } }
    });
    y = doc.autoTable.previous.finalY + 10;
    ctx.font = '16px Verdana';
    if (y + 50 > height) {
      doc.addPage();
      y = 20;
    }
    doc.text("Tabla de PostCondiciones", 14, y);
    y += 16;
    columns = ["Indice", "PostCondiciones"];
    rows = [];
    auxRows = this.casoUso.postcondiciones;
    if (auxRows == undefined) {
      auxRows = [];
      auxRows.push("N/A");
    }
    indice = 0;
    auxRows.forEach(item => {
      let aux = [indice.toString()];
      aux.push(item);
      rows.push(aux);
      indice++;
    });
    doc.autoTable(columns, rows, {
      startY: y,
      columnStyles: { text: { columnWidth: 'auto' } }
    });
    y = doc.autoTable.previous.finalY + 10;
    ctx.font = '16px Verdana';
    doc.text("Tabla de Requisistos Especiales", 14, y);
    y += 16;
    columns = ["Indice", "Requisistos Especiales"];
    rows = [];

    auxRows = this.casoUso.requisitosEspeciales;
    if (auxRows == undefined) {
      auxRows = [];
      auxRows.push("N/A");
    }
    indice = 0;
    auxRows.forEach(item => {
      let aux = [indice.toString()];
      aux.push(item);
      rows.push(aux);
      indice++;
    });
    doc.autoTable(columns, rows, {
      startY: y,
      columnStyles: { text: { columnWidth: 'auto' } }
    });
    doc.save('Reporte del Caso de Uso: '+this.casoUso.nombre+'.pdf');
  }
}
