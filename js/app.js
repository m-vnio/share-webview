const root      = document.getElementById('root')
const socket    = io('https://l8qn2l7t-5001.brs.devtunnels.ms/');
const $template = document.createElement('div')

const url = new URL(window.location.href);
const queryParams = url.searchParams;

const findId    = ( id ) => {
    const $element = $template.querySelector('#' + id)
    $element.removeAttribute('id')
    return $element
}

function rand( ...params ){
    const [ max, min = 0] = params.reverse()
    return Math.floor(Math.random() * ((max + 1) - min) + min)
}

function genereteKey ( length = 7 ){

    const upper     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower     = upper.toLocaleLowerCase()
    const number    = '1234567890'

    let generate    = [ upper, lower, number ].join('')
    
    
    return Array( length ).fill('').map( () => generate[ rand( generate.length - 1 ) ]).join('')
    
}
 
function renderItemLink ( data = {}, id = null ) {

    const link = `http://${ data.ip }:${4445}`

    return `
        <div class="div_8HE7EX5" data-link="${ link }/${ Date.now() }.mkv" data-link-play="${ link }" data-id="id-${ id }" data-focus>
            <div class="div_6Ej8ouG">
                <img src="${ data.image ?? '' }" alt="" style="${ data.image ? '' : 'visibility:hidden'}">
                <p>${ link }</p>
            </div>
            <div class="div_9cruItm">
                <button class="button_q623lM2" data-action="openDefault"><i class="fi fi-rr-play"></i></button>
                <button class="button_q623lM2" data-action="openWith"><i class="fi fi-rr-resize"></i></button>
                <button class="button_q623lM2" data-action="copyLink"><i class="fi fi-rr-copy"></i></button>
                <button class="button_q623lM2" data-action="shareLink"><i class="fi fi-rr-share"></i></button>
            </div>
        </div>
    `
}

function datetimeAdd() {
    const date = new Date()
    date.setDate( date.getDate() + 1 )
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date.getTime()
}

const component$r =()=> {

    const url = new URL(window.location.href);
    const queryParams = url.searchParams;

    $template.innerHTML = `
        <div class="div_OSKBCD">
            <div class="div_rz0K7v">
                <div class="div_iSIvEga">
                    <div class="div_1yWpJY">
                        <img id="imageProfile" src="https://picsum.photos/40/40">
                        <input type="text" id="codigoInput" value="" readonly>
                    </div>
                    <button id="codigo"><i class="fi fi-rr-password"></i></button>
                </div>
                <div id="contenedorButton" class="div_EYpSdgc" >
                    <div id="itemLink" class="div_ko7wWU">
                        <div class="element-loader" style="--color:#ffffff; margin-top: 20px"></div>
                    </div>
                </div>
            </div>
            <div class="div_NHnmszQ">
                <div id="codigoQR" class="div_1ecjzLK"></div>
            </div>
        </div>
    `
    const $element = $template.children[0]

    const itemLink      = findId('itemLink')

    const imageProfile  = findId('imageProfile')

    const codigoQR      = findId('codigoQR')
    const codigoInput   = findId('codigoInput')
    const codigo        = findId('codigo')
    codigoInput.value   = queryParams.get('code')

    new QRCode(codigoQR, `${ location.origin }${ location.pathname }?code=${ codigoInput.value }&qr=true`);

    let focusElement = null

    const actionButton =( action, link, linkPlay )=>{

        if( action == 'openDefault' ) {
            Android.openWithDefault( `${linkPlay}/${ Date.now() }.mkv` )
        } 
        
        else if( action == 'openWith' ) {
            Android.openWithApp( link )
        }

        else if( action == 'copyLink' ) {
            Android.copyText( link.value )
        }

        else if( action == 'shareLink' ) {
            Android.shareLink( link )
        }
    }

    codigo.addEventListener('click', ()=> {
        const code = prompt('Ingrese el codigo')
        if( !code ) return
        if( code.trim() == '' ) return
        localStorage.setItem('code', code)
        location.href = `${ location.origin + location.pathname }?code=${ code }&me-ip=${ queryParams.get('ip') }&ip=${ queryParams.get('ip') }`
    })

    addEventListener('focusin', e => {

        if( e.target.closest('[ data-action ]') ) {
            contenedorButton.querySelectorAll('[ data-focus ]').forEach(element => {
                element.setAttribute('data-focus', '')
            });
    
            e.target.closest('[ data-focus ]').setAttribute('data-focus', true)
            focusElement = e.target
        }
        
    })

    addEventListener('click', e => {

        const button = e.target.closest('button[ data-action ]')

        if( button ) {
            const action = button.getAttribute('data-action')
            const link      = button.closest('[ data-link ]').getAttribute('data-link')
            const linkPlay  = button.closest('[ data-link ]').getAttribute('data-link-play')
            actionButton( action, link, linkPlay )
        } 
        else if( focusElement ) { setTimeout(()=> focusElement.focus()) }

        
    })

    addEventListener('keypress', e => {
        e.preventDefault()
        console.log('hola');
    })

    addEventListener('keydown', e => {
        e.preventDefault()

        if( !focusElement ) return

        const dataFocus = contenedorButton.querySelector('[ data-focus = true ]')
        const buttons = Array.from( dataFocus.querySelectorAll('button') )
        const index   = buttons.findIndex( button => button == e.target )

        if( ['ArrowLeft'].includes( e.key ) ) {
            if( ( index - 1 ) > -1 ) buttons[ index - 1 ].focus()
            else buttons[ buttons.length - 1 ].focus()
        }

        else if( ['ArrowRight'].includes( e.key ) ) {
            if( ( index + 1 ) < buttons.length ) buttons[ index + 1 ].focus()
            else buttons[0].focus()
        } 

        else if( ['ArrowDown'].includes( e.key ) ) {
            const action = buttons[ index ].getAttribute('data-action')
            const next = dataFocus.nextElementSibling

            if( next ) {
                next.querySelector(`button[ data-action = ${ action } ]`).focus()
            } else {
                contenedorButton.querySelector(`[ data-focus ] button[ data-action = ${ action } ]`).focus()
            }
            
        } 

        else if( ['ArrowUp'].includes( e.key ) ) {
            const action = buttons[ index ].getAttribute('data-action')

            const previous = dataFocus.previousElementSibling

            if( previous ) {
                previous.querySelector(`button[ data-action = ${ action } ]`).focus()
            } else {
                contenedorButton.querySelector(`[ data-focus ]:last-child button[ data-action = ${ action } ]`).focus()
            }
            
        } 

        else if( [ 'Enter' ].includes( e.key ) ) {

            const action = buttons[index].getAttribute('data-action')
            const link   = dataFocus.getAttribute('data-link')
            const linkPlay   = dataFocus.getAttribute('data-link-play')
            actionButton( action, link, linkPlay )
           
        } 
    })

    fetch( 'https://picsum.photos/40/40' )
        .then( res => {
            socket.emit('user-list', JSON.stringify( {
                ip      : queryParams.get('me-ip') ?? queryParams.get('ip'),
                code    : queryParams.get('code'),
                image   : res.url,
            }))

            imageProfile.setAttribute('src', res.url)
        })
    
    socket.on('user-list', Data => {
        
        itemLink.innerHTML = ''

        JSON.parse( Data ).forEach( data => {
            if( !data.status ) return
            if( data.data.code != queryParams.get('code') ) return

            if( socket.id == data.id ) itemLink.insertAdjacentHTML('afterbegin', renderItemLink( data.data, data.id ))
            else itemLink.insertAdjacentHTML('beforeend', renderItemLink( data.data, data.id ))
        })

        itemLink.querySelector('button').focus()

    })

    return $element
 }

 
const component$root =()=>{

    history.replaceState(null, null, `${ location.origin + location.pathname }?code=${ localStorage.getItem('code') }&ip=${ queryParams.get('ip') }&me-ip=${ queryParams.get('me-ip') }`)
    return component$r()
    
}

addEventListener('DOMContentLoaded', ()=> {

    if( queryParams.get('qr') == 'true' ) {
        if( queryParams.get('code') ) {
            localStorage.setItem('code', queryParams.get('code'))
        }
    }

    if( localStorage.getItem('datetime') ) {
        if( Date.now() > parseInt( localStorage.getItem('datetime') ) ) {
            localStorage.removeItem('code')
            localStorage.removeItem('datetime')
        }
    }

    if( !localStorage.getItem('datetime') )
        localStorage.setItem('datetime', datetimeAdd())

    if( !localStorage.getItem('code') )
        localStorage.setItem('code', genereteKey(5))

    document.getElementById('root').append( component$root() )

})