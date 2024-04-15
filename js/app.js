const root      = document.getElementById('root')
const socket    = io('https://l8qn2l7t-5001.brs.devtunnels.ms/');
const $template = document.createElement('div')

if( !localStorage.getItem('codigo') ) localStorage.setItem('codigo', '')

const url = new URL(window.location.href);
const queryParams = url.searchParams;

const findId    = (id) => {
    const $element = $template.querySelector('#' + id)
    $element.removeAttribute('id')
    return $element
}

const component$r =()=>{

    const getLink =( ip, port, name )=> `http://${ ip }:${port}/${ name }.mkv`

    const url = new URL(window.location.href);
    const queryParams = url.searchParams;

    $template.innerHTML = `
        <div class="div_OSKBCD">
            <input type="hidden" id="link" readonly>
            <div id="contenedorButton" class="div_EYpSdgc">
                <div class="div_HBUafNB">
                    <button id="openWith" class="button-focus"><i class="fi fi-rr-play"></i></button>
                    <button id="copy"><i class="fi fi-rr-copy"></i></button>
                    <button id="share"><i class="fi fi-rr-share"></i></button>
                </div>
                <div id="itemLink" class="div_ko7wWU"></div>
            </div>
            <div id="recibir" class="div_1ecjzLK"></div>
        </div>
    `
    const $element = $template.children[0]

    const recibir   = findId('recibir')
    const link      = findId('link')
    link.value      = getLink(queryParams.get('ip'), 4445, Date.now())

    const openWith  = findId('openWith')
    const copy      = findId('copy')
    const share     = findId('share')

    const itemLink  = findId('itemLink')
    const id        = Date.now()

    const Links     = []

    const contenedorButton = findId('contenedorButton')

    new QRCode(recibir, location.origin + location.pathname + '?e=' + queryParams.get('r') + '&ip=' + queryParams.get('ip'));

    

    const renderItemLink =( ip )=>{
        if( ip == 'null' ) return
        const link = getLink(ip, 4445, id)
        
        if( Links.some( link_ => link_ == link ) ) return
        Links.push( link )

        itemLink.insertAdjacentHTML('beforeend', `
            <button class="button_q623lM2" data-link="${ link }">
                <p>${ link }</p>
                <span>${ queryParams.get('ip') == ip ? 'actual' : 'otro' } dispositivo</span>
            </button>
        `)
    }
    
    socket.on('connecting', data => {
        data = JSON.parse(data)

        if( data.id == queryParams.get('r') ) {
            renderItemLink( data.message )
        }
    });

    socket.on('sending', data => {
        data = JSON.parse(data)

        if( data.id == queryParams.get('r') ) {
            Android.openWithApp( data.message )
        }
            
    });

    openWith.addEventListener('click', ()=> {
        Android.openWithDefault( getLink(queryParams.get('ip'), 4445, Date.now()) )
    })

    copy.addEventListener('click', ()=> {
        Android.copyText( link.value )
    })

    share.addEventListener('click', ()=> {
        Android.shareLink( link.value )
    })

    itemLink.addEventListener('click', e => {
        const button = e.target.closest('button')

        if( button ) {

            const link = button.getAttribute('data-link')

            if( link ) {
                Android.openWithApp( link )
            }

        }
    })

    let focusElement = null

    addEventListener('focusin', e => {
        focusElement = e.target
    })

    addEventListener('click', () => {
        setTimeout(()=> focusElement.focus())
    })

    addEventListener('keydown', e => {
        e.preventDefault()

        const buttons = Array.from( contenedorButton.querySelectorAll('button') )
        const index   = buttons.findIndex( button => button == e.target )

        if( ['ArrowUp', 'ArrowLeft'].includes( e.key ) ) {
            if( ( index - 1 ) > -1 ) buttons[ index - 1 ].focus()
            else buttons[ buttons.length - 1 ].focus()
        }

        else if( ['ArrowDown', 'ArrowRight'].includes( e.key ) ) {
            if( ( index + 1 ) < buttons.length ) buttons[ index + 1 ].focus()
            else buttons[0].focus()
        } 

        else if( [ 'Enter' ].includes( e.key ) ) {

            const link = buttons[ index ].getAttribute('data-link')
            Android.openWithApp( link )
        } 

        else {
            if( ( index + 1 ) < buttons.length ) buttons[ index + 1 ].focus()
            else buttons[ 0 ].focus()
        }
    })

    setTimeout(()=> openWith.focus())
    renderItemLink( queryParams.get('ip') )
 
    return $element
}

const component$e =()=>{

    const getLink =( ip, port, name )=> `http://${ ip }:${port}/${ name }.mkv`

    const url = new URL(window.location.href);
    const queryParams = url.searchParams;

    $template.innerHTML = `
        <div class="div_OSKBCD">
            <input type="hidden" id="link" readonly>
            <div id="contenedorButton" class="div_EYpSdgc">
                
                <div id="itemLink" class="div_ko7wWU"></div>
            </div>
        </div>
    `
    const $element = $template.children[0]

    const itemLink  = findId('itemLink')
    const id        = Date.now()

    const renderItemLink =( ip )=>{
        if( ip == 'null' ) return

        const link = getLink(ip, 4445, id)

        itemLink.insertAdjacentHTML('beforeend', `
            <button class="button_q623lM2" data-link="${ link }">
                <p>${ link }</p>
                <span>${ queryParams.get('me-ip') == ip ? 'actual' : 'otro' } dispositivo</span>
            </button>
        `)
    }

    socket.emit('connecting', JSON.stringify({ 
        id: queryParams.get('e'),
        message : queryParams.get('me-ip')
    }));
    

    itemLink.addEventListener('click', e => {
        const button = e.target.closest('button')

        if( button ) {
            const link = button.getAttribute('data-link')
            socket.emit('sending', JSON.stringify({ id: queryParams.get('e'), message : link }));
        }
    })

    renderItemLink( queryParams.get('me-ip') )
    renderItemLink( queryParams.get('ip') )
 
    return $element
}
 
const component$root =()=>{


    if( queryParams.get('r') ) {
        return component$r()
    }

    else if( queryParams.get('e') ) {
        return component$e()
    }

    history.replaceState(null, null, location.origin + location.pathname + '?r=' + Date.now() + '&ip=' + queryParams.get('ip'))
    return component$r()
    
}

addEventListener('DOMContentLoaded', ()=> {
    document.getElementById('root').append(component$root())
})