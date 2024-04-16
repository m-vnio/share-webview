const component$rr =()=>{

    const getLink =( ip, port, name )=> `http://${ ip }:${port}/${ name }.mkv`

    const url = new URL(window.location.href);
    const queryParams = url.searchParams;

    $template.innerHTML = `
        <div class="div_OSKBCD">
            <input type="hidden" id="link" readonly>
            <div id="contenedorButton" class="div_EYpSdgc">
                <div class="div_HBUafNB" style="display:none">
                    <button id="openWith" class="button-focus"><i class="fi fi-rr-play"></i></button>
                    <button id="copy"><i class="fi fi-rr-copy"></i></button>
                    <button id="share"><i class="fi fi-rr-share"></i></button>
                </div>
                <div id="itemLink" class="div_ko7wWU"></div>
            </div>
            <div class="div_gSoy8mV">
                <div id="recibir" class="div_1ecjzLK"></div>
                <div class="div_iSIvEga">
                    <button id="codigo"><i class="fi fi-rr-pencil"></i></button>
                    <input type="text" id="codigoInput" value="" readonly>
                </div>
            </div>
        </div>
    `
    const $element = $template.children[0]

    const recibir   = findId('recibir')
    const link      = findId('link')
    link.value      = getLink(queryParams.get('ip'), 4445, Date.now())

    const openWith  = findId('openWith')
    const copy      = findId('copy')
    const share     = findId('share')
    const codigo    = findId('codigo')
    const codigoInput    = findId('codigoInput')

    const itemLink  = findId('itemLink')
    const id        = Date.now()

    const Links     = []

    const contenedorButton = findId('contenedorButton')

    codigoInput.value = 'qcQj9'
    //location.origin + location.pathname + '?e=' + queryParams.get('r') + '&ip=' + queryParams.get('ip')


    

    new QRCode(recibir, `${ location.origin }${ location.pathname }?e=${ codigoInput.value }`);
    

    const renderItemLink =( ip )=>{
        //if( ip == 'null' ) return
        const link = getLink(ip, 4445, id)
        
        if( Links.some( link_ => link_ == link ) ) return
        Links.push( link )

        itemLink.insertAdjacentHTML('beforeend', `
            <div class="div_8HE7EX5" data-link="${ link }"  data-item>
                <div class="div_6Ej8ouG">
                    <img src="https://picsum.photos/40/40" alt="Imagen aleatoria">
                    <p>${ link }</p>
                </div>
                <div class="div_9cruItm">
                    <button class="button_q623lM2"><i class="fi fi-rr-play"></i></button>
                    <button class="button_q623lM2"><i class="fi fi-rr-resize"></i></button>
                    <button class="button_q623lM2"><i class="fi fi-rr-copy"></i></button>
                    <button class="button_q623lM2"><i class="fi fi-rr-share"></i></button>
                </div>
            </div>
        `.repeat(2))
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

    codigo.addEventListener('click', ()=> {
        const code = prompt('Ingrese el codigo del QR')
        alert(`${ location.origin }${ location.pathname }?e=${ code }`)
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

            if( [ openWith, copy, share ].includes( buttons[ index ] ) ) buttons[ index ].dispatchEvent(new CustomEvent('click'))
            else Android.openWithApp( link )

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

    const url = new URL(window.location.href);
    const queryParams = url.searchParams;

    $template.innerHTML = `
        <div class="div_OSKBCD" style="display:flex">
            <div id="contenedorButton" class="div_EYpSdgc" style="margin:auto">
                <div id="itemLink" class="div_ko7wWU"></div>
            </div>
        </div>
    `

    const $element = $template.children[0]
    const itemLink = findId('itemLink')

    addEventListener('click', e => {

        const button = e.target.closest('button[ data-action ]')

        if( button ) {

            const action = button.getAttribute('data-action')
            const link   = button.closest('[ data-link ]').getAttribute('data-link')

            socket.emit('sending', JSON.stringify({
                codigo  : queryParams.get('e'),
                action,
                link
            }))
        }
        
    })

    fetch( 'https://picsum.photos/40/40' )
        .then( res => {
            socket.emit('user-list', JSON.stringify( {
                ip      : queryParams.get('ip'),
                codigo  : queryParams.get('e'),
                image   : res.url,
            } ))
        })

    socket.on('user-list', Data => {

        itemLink.innerHTML = ''

        JSON.parse( Data ).forEach( data => {
            if( !data.status ) return
            if( data.data.codigo != queryParams.get('e') ) return

            if( socket.id == data.id ) itemLink.insertAdjacentHTML('afterbegin', renderItemLink( data.data, data.id ))
            else itemLink.insertAdjacentHTML('beforeend', renderItemLink( data.data, data.id ))
        })

        itemLink.querySelector('button').focus()

    })

    return $element
}
 