const root      = document.getElementById('root')
const socket    = io('https://l8qn2l7t-5001.brs.devtunnels.ms/');
const $template = document.createElement('div')

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

function getLink(ip, port, name) {
    return `http://${ ip }:${port}/${ name }.mkv`
}

function renderItemLink ( data = {}, id = null ) {
    const link = getLink(data.ip, 4445, Date.now())

    return `
        <div class="div_8HE7EX5" data-link="${ link }" data-id="id-${ id }" data-focus>
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

const component$r =()=> {

    const url = new URL(window.location.href);
    const queryParams = url.searchParams;

    $template.innerHTML = `
        <div class="div_OSKBCD">
            <div class="div_rz0K7v">
                <div class="div_iSIvEga">
                    <img id="imageProfile" src="https://picsum.photos/40/40">
                    <input type="text" id="codigoInput" value="" readonly>
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

    const itemLink  = findId('itemLink')

    const imageProfile  = findId('imageProfile')

    const codigoQR      = findId('codigoQR')
    const codigoInput   = findId('codigoInput')
    const codigo        = findId('codigo')
    codigoInput.value   = queryParams.get('code')

    new QRCode(codigoQR, `${ location.origin }${ location.pathname }?code=${ codigoInput.value }`);

    let focusElement = null


    const actionButton =( action, link )=>{

        if( action == 'openDefault' ) {
            Android.openWithDefault( link )
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
        const code = prompt('ingrese el codigo')
        if( !code ) return
        if( code.trim() == '' ) return
        location.href = `${ location.origin }${ location.pathname }?code=${ code }&me-ip=${ queryParams.get('ip') }&ip=${ queryParams.get('ip') }`
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
            const link   = button.closest('[ data-link ]').getAttribute('data-link')
            actionButton( action, link )
        } 
        else if( focusElement ) { setTimeout(()=> focusElement.focus()) }

        
    })

    addEventListener('keydown', e => {
        e.preventDefault()

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
            actionButton( action, link )
           
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

    const url = new URL(window.location.href);
    const queryParams = url.searchParams;


    if( queryParams.get('code') ) {
        return component$r()
    }
 
    history.replaceState(null, null, location.origin + location.pathname + '?code=' + genereteKey(5) + '&ip=' + queryParams.get('ip'))
    return component$r()
    
}

addEventListener('DOMContentLoaded', ()=> {
    document.getElementById('root').append(component$root())
})

//div_rz0K7v