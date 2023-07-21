"use strict";
const contenido = document.querySelector('.contenido')
const btnGrabarTexto = document.querySelector('.btn-grabar')
/* Primero creamos los objetos para poder grabar nuestra voz con el microfono */
const reconocimientoVoz = window.SpeechRecognition || window.webkitSpeechRecognition
const reconocimiento = new reconocimientoVoz()
reconocimiento.onstart = ()=>{
    contenido.innerHTML = 'Escuchando...'
}
// DESDE LA VOZ EJECUTA
reconocimiento.onresult = event =>{
    let mensaje = event.results[0][0].transcript
    contenido.innerHTML = mensaje
    leerTextoCondicionado(mensaje) // desde aqui redirecciona
}
const leerTextoSimple = (mensaje)=>{
    const voz = new SpeechSynthesisUtterance()
    voz.text = mensaje
    window.speechSynthesis.speak(voz)
}
const leerTextoCondicionado = (mensaje)=>{
    const voz = new SpeechSynthesisUtterance()
    // GENERA NUEVA TRANSACCION
    if(mensaje.includes('nueva')){ //nueva transaccion
        // voz.text = 'nueva transaccion'
        let respuesta= nuevaTrans() //si ya existe es false
        if (respuesta) {
            voz.text = mensaje
            window.speechSynthesis.speak(voz)
        }
    }
    // ELIMINA TRANSACCION EN LOCAL
    if(mensaje.includes('borrar')){
        let arrKeyFin=JSON.parse(localStorage.getItem('keys'))
        let largo=arrKeyFin.length
        if(largo===0) {
            habla('Ya no hay transacciones en Local')
        } else {
            leeKeys()
            // habla('Seleccione transaccion a borrar')
            // elejir transaccion a borrar
            // borrar(key)
        }
    }
    //DESPLIEGA TRANSACCION SELECCIONADA
    if(mensaje.includes('despliega')){ //nueva transaccion
        despliegaTrans()
        //SEGUIR DESARROLLO
    }
    //LIMPIA PANTALLA
    if(mensaje.includes('limpia')){ //nueva transaccion
        limpiaTabla()
    }
     //indica transaccion actual
     if(mensaje.includes('actual')){ //nueva transaccion
        // debugger
        let transaActual=localStorage.getItem('transaccion') //busca transa actual
        let mensajeTransa='La transaccion en curso es '+transaActual
        contenido.innerHTML = mensajeTransa
        habla(mensajeTransa)
    }

    // primero validar que exista transaccion no null
    // INGRESA VALOR EN ARREGLO
    let verTrans=leeTrans()
    if (verTrans===null){
        // habla('Ingrese una nueva transaccion')
        habla("ingrese una nueva transaccion, no hay ninguna creada")

    } else {
        ingresaValor(mensaje)
    }
}
btnGrabarTexto.addEventListener('click', ()=>{
    reconocimiento.start()
})
// ---------------------------------------
function habla(mensaje){
    const voz = new SpeechSynthesisUtterance()
    voz.text = mensaje
    window.speechSynthesis.speak(voz)
}
function ingresaValor(mensaje){
    let keyTrans= leeTrans() // obtiene key de transaccion actual
    if (isNaN(mensaje)) { //al ingresar nueva trans
        mensaje=0
    } else {
        recLocalArr(keyTrans,mensaje)
        var tablaDat = document.getElementById('tblCta')
        tablaDat.style.display='block'
    }
}
function recLocalArr(key,arr) {
   let arrNum=parseInt(arr)
   let arreglo=JSON.parse(localStorage.getItem(key))
   // si aun no existe arreglo
   if (arreglo===null) {
       arreglo=[arr]
       let transJson= JSON.stringify(arreglo)
       localStorage.setItem(key,transJson)
   } else {
        // PRIMER MENSAJE DE INGRESO
        let mensajeIng='ingresando '+ arr
        habla(mensajeIng)
        // AGREGA AL ARREGLO EN LOCAL
        arreglo.push(arrNum)
        let transJson= JSON.stringify(arreglo)
        localStorage.setItem(key,transJson)
        //efectua la suma
        let arregloFin=JSON.parse(localStorage.getItem(key))
        let largo=arregloFin.length
        let numArr=0
        let suma=0
        for (let i=0; i <= largo-1; i++){
            numArr=arregloFin[i]
            suma = suma+numArr
        }
        let tot=suma.toString()
        let mensaje='El total es: ' + tot
        contenido.innerHTML =mensaje
        habla(mensaje)
   }
    //graba en paralelo en arreglo local acumulando
    grabaArreglo(arr)
    despliegaAcumulado()
}
function indiceAhora(){
    console.log("indiceAhora()");
    let date = new Date();
    let fecha=date.toLocaleDateString();
    let fechaIso=date.toISOString();
    console.log("Fecha iso: " + fechaIso);
    let anioHoy=fechaIso.substring(0,4);
    let mesHoy=fechaIso.substring(5,7);
    let diaHoy=fechaIso.substring(8,10);
    let fechaHoy= diaHoy+mesHoy+anioHoy; 
    console.log("fecha hoy: " + fechaHoy);
    let currentTime = new Date();
    let hora=currentTime.getHours();
    let minutos=currentTime.getMinutes();   
    let segundos=currentTime.getSeconds();
    let hori= hora.toString();  
    let mini= minutos.toString();  
    let segi= segundos.toString();  
    let horaTrans=(hori + mini + segi);
    let indiceAhora=fechaHoy+horaTrans; // entrega indice global
    return indiceAhora;
}
function borrar(key) {
    let confirma=confirm('desea eliminar la transaccion '+key)
    if (confirma){
        localStorage.removeItem(key);               // * ELIMINA dato LOCAL CURSOS
        habla('cuenta borrada')
    } else {
        habla('cancela eliminacion')    
    }
}
function nuevaTrans(){
    leerTextoSimple('ingrese nombre de la transaccion')
    let nomTrans=prompt('ingrese nombre transaccion')
    if (nomTrans) {
        let lectura= localStorage.getItem(nomTrans)
        if (lectura) {
            habla('ya existe la transaccion')
            return false
        } else {
            habla('transaccion '+nomTrans + ' ingresada')
            localStorage.setItem('transaccion',nomTrans) //graba
            let arreglo=[0]
            let transJson= JSON.stringify(arreglo)
            localStorage.setItem(nomTrans,transJson) //graba
            localStorage.removeItem('acumulando')
            grabaKey(nomTrans) //GRABA EN UN ARREGLO CADA KEY INGRESADA
            return true
        }
    } else {
        leerTextoSimple('cancelado')
        return false
    }
}
function leeTrans(){
    let nueTrans= localStorage.getItem('transaccion'); 
    return nueTrans
}
function grabaArreglo(itemArr){
    let arreglo=JSON.parse(localStorage.getItem('acumulando'))
    if (arreglo===null) {
        arreglo=[itemArr]
        let transJson= JSON.stringify(arreglo)
        localStorage.setItem('acumulando',transJson)
    } else {
        arreglo.push(itemArr)
        let transJson= JSON.stringify(arreglo)
        localStorage.setItem('acumulando',transJson)
        //efectua la suma
        let arregloFin=JSON.parse(localStorage.getItem('acumulando'))
        let largo=arregloFin.length
        let numArr=0
        let suma=0
        for (let i=0; i <= largo-1; i++){
            numArr=arregloFin[i]
            suma = suma+numArr
        }
    }
}
function grabaKey (key) {
    let arrKey=JSON.parse(localStorage.getItem('keys'))
    if (arrKey===null) {
        arrKey=[key]
        let transJson= JSON.stringify(arrKey)
        localStorage.setItem('keys',transJson)
    } else {
        arrKey.push(key)
        let transJson= JSON.stringify(arrKey)
        localStorage.setItem('keys',transJson)
    }
}
function leeKeys() {
    let select = document.createElement("select")
    select.id = "seleccion"
    let arrKeyFin=JSON.parse(localStorage.getItem('keys'))
    let largo=arrKeyFin.length
    if(largo===0) {
        habla('Ya no hay transacciones en Local')
    } else {
        for (let i=0; i <= largo-1; i++){
            let llave=arrKeyFin[i]
            //crea opciones en select
            let option1 = document.createElement("option")
            option1.setAttribute("value", llave)
            let option1Texto = document.createTextNode(llave)
            option1.appendChild(option1Texto)
            select.appendChild(option1)
            document.body.appendChild(select)
        }
        const button = document.createElement('button')
        button.type = 'button'
        button.innerText = 'Eliminar'
        button.style.background='red'
        button.style.color='white'
        button.onclick = function() {
            eliminaTrans()
        }
        document.body.appendChild(button)
        habla('seleccione transaccion a borrar')
    }
}
function eliminaTrans(){
    let selectKey=document.getElementById('seleccion').value
    localStorage.removeItem(selectKey);  
    let arrKey=JSON.parse(localStorage.getItem('keys'))
    const arrNuevo = arrKey.filter((item) => item !== selectKey)
    let transJson= JSON.stringify(arrNuevo)
    localStorage.setItem('keys',transJson)
    habla('eliminando '+selectKey)
    location.reload()
}
function despliegaAcumulado() {
    try {
        let dato=document.getElementById("fila0")
        let respuesta=dato.innerHTML
        let respuestaStr=parseInt(respuesta)
        if (respuesta!==0){
            limpiaTabla()
        }
      } catch (error) {
        // console.error(error)
        // continue()
    }
    let tablaCuenta = document.getElementById('tblCta')
    let cuerpoTablaCuenta = document.createElement("tbody")
    let item='Item'
    let cant=0
    let val=0
    let tot=cant*val
    let arreglin=JSON.parse(localStorage.getItem('acumulando'))
    let largo=arreglin.length
    for (let i=0; i <= largo-1; i++){
        val=arreglin[i]
        let fila=document.createElement("tr") //crea una fila fil
        let td=document.createElement("td")   //crea celda columna
        td.innerHTML=val  
        let indice=i.toString() // ejemplo fila1
        // alert(indice)
        let filaId="fila"+indice
        // alert(filaId)
        td.id=filaId //asigna id a la fila
        fila.appendChild(td)
        cuerpoTablaCuenta.appendChild(fila) //genera fila al final
    }
    tablaCuenta.appendChild(cuerpoTablaCuenta) //cierra tabla
}
function limpiaTabla() {
    location. reload()
}
function despliegaTrans(){
    let select = document.createElement("select")
    select.id = "seleccion"
    let arrKeyFin=JSON.parse(localStorage.getItem('keys'))
    if(arrKeyFin===null) {
        return "local vacio"
    }   
    let largo=arrKeyFin.length
    if(largo===0) {
        habla('Ya no hay transacciones en Local')
    } else {
        for (let i=0; i <= largo-1; i++){
            let llave=arrKeyFin[i]
            //crea opciones en select
            let option1 = document.createElement("option")
            option1.setAttribute("value", llave)
            let option1Texto = document.createTextNode(llave)
            option1.appendChild(option1Texto)
            select.appendChild(option1)
            document.body.appendChild(select)
        }
        habla('indique transaccion a desplegar')
        const buttonDesp = document.createElement('button')
        buttonDesp.type = 'button'
        buttonDesp.innerText = 'Desplegar'
        buttonDesp.style.background='green'
        buttonDesp.onclick = function() {
            despliegueSelec() 
        }
        document.body.appendChild(buttonDesp)
    }
}
function despliegueSelec(){
    let selectKey=document.getElementById('seleccion').value
    habla('despliega ' + selectKey)
    let arregloSel=localStorage.getItem(selectKey)
    let arregloSelOk= JSON.parse(arregloSel)
    let largo=arregloSelOk.length
    let val=0 
    let textoDespliegue=document.getElementById('contenido')
    let txtAcumula=""
    let totalAcum=0//total acumulado
    let valInt=0 //valor entero
    for (let i=1; i <= largo-1; i++){
        val=arregloSelOk[i]
        txtAcumula=txtAcumula+val+'<br>'
        valInt=parseInt(val) //transforma a num
        totalAcum=totalAcum+valInt
    }
    txtAcumula=txtAcumula + '----'+'<br>'+totalAcum.toString();
    textoDespliegue.innerHTML=txtAcumula
    habla("el total es "+totalAcum.toString())
}
