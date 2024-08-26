const icon      = new IconSVG()

const actionButton =( action, link )=>{

    const linkPlay = `http://${link}/${ Date.now() }.mkv`
    console.log(linkPlay);

    // console.log(linkPlay);
    // return
    if( action == 'play' ) {
        Android.openWithDefault( linkPlay, "video/*")
    } 
    
    else if( action == 'open' ) {
        Android.openWithApp( linkPlay, "video/*", "Abrir con")
    }

    else if( action == 'copy' ) {
        Android.copyText( linkPlay, 'Copiado', 'Link' )
    }

    else if( action == 'share' ) {
        Android.shareLink( linkPlay, "text/plain", "Compartir Enlace")
    }
}

const att =( array, index )=>{
    return array.slice( index )[0]
}

document.getElementById('app').innerHTML = `
    <header class="header_mO3t4Y0">
        <div class="div_557EbR4">
            <div class="div_6pxFPgJ">
                <img src="" alt="" id="image">
                <div>
                    <p style="color:#000000" id="ipl">-</p> 
                    <p style="color:#000000" id="test">-</p> 
                </div>
            </div>
            <div class="div_VWyUlPI" data-ip="">
                <button class="button_x7jX1VV one" data-action="play">${ icon.get('fi fi-rr-play') }</button>
                <button class="button_x7jX1VV one" data-action="open">${ icon.get('fi fi-rr-expand-arrows') }</button>
                <button class="button_x7jX1VV one" data-action="copy">${ icon.get('fi fi-rr-copy') }</button>
                <button class="button_x7jX1VV one" data-action="share">${ icon.get('fi fi-rr-share') }</button>
            </div>
        </div>
    </header>
    <div class="div_DuHLFba" id="datas"></div>
`

addEventListener('keydown', e => {
    e.preventDefault()

    if( ['ArrowRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'Enter'].includes(e.key) ) {

        const buttons   = Array.from( document.querySelectorAll('.button_x7jX1VV') )
        const buttonf   = document.querySelector('.button_x7jX1VV.focus')
        const index     = buttons.findIndex( button => button == buttonf )

        const num       = 4
        
        document.getElementById('test').textContent = e.key

        if( e.key == 'ArrowRight' ){
            att( buttons, index + 1) ?? att( buttons, 0 )
            // const button = buttons.at(index + 1) ?? buttons.at(0)
            const button = att( buttons, index + 1) ?? att( buttons, 0 )
            button.focus()
        }
        if( e.key == 'ArrowLeft' ) {
            //buttons.at(index - 1 ).focus()
            // buttons.at(index - 1 ).focus()
            att( buttons, index - 1 ).focus()
        }
        if( e.key == 'ArrowDown' ) {
            //const button = buttons.at(index + num) ?? buttons.at(index - buttons.length + num) 
            const button = att( buttons, index + num ) ?? att( buttons, index - buttons.length + num )
            button.focus()
        }
        if( e.key == 'ArrowUp' ) {
            // buttons.at(index - 4).focus()
            att( buttons, index - 4).focus()
        }

        if( e.key == 'Enter' ) {
            // const button = buttons.at(index)
            const button = att( buttons, index)
            const ip     = button.parentElement.getAttribute('data-ip')
            actionButton(button.getAttribute('data-action'), ip);
        }
    }
})


addEventListener('DOMContentLoaded', ()=> {

    const button = document.querySelector('.button_x7jX1VV')
    button.focus()
    
})

addEventListener('focusin', e => {

    const button = e.target 

    document.querySelectorAll('button.focus').forEach( button => button.classList.remove('focus') )
    button.classList.add('focus')
    
})

addEventListener('click', e => {
    const button = e.target.closest('button')
    if( !button ) {
        const button = document.querySelector('.button_x7jX1VV.focus')
        if( button ) {
            button.focus()
        }
    }

    if( button ) {
        const ip     = button.parentElement.getAttribute('data-ip')
        actionButton(button.getAttribute('data-action'), ip);
    }
})


addEventListener('contextmenu', e=> {
   // e.preventDefault()
})

const one = ()=>{
    return fetch('https://app.victor01sp.com/ip/get.php')
        .then( res => res.json() )
        .then( data => {
            return data.data
        }) 
}

const two =()=>{
    return new Promise((resolve, reject) => {
        const url = new URL(location.href)
        const search = new URLSearchParams( url.search )
        const ip = Android.getLocalIpAddress() //search.get('ip')
        const iplocal = `${ip}:4445`
        document.getElementById('ipl').textContent = iplocal
        document.querySelector('[data-ip]').setAttribute('data-ip', iplocal)
        resolve(ip)
    })
    

    // return getLIP().then( ip => {
    //     const iplocal = `${ip}:4445`
    //     document.getElementById('ipl').textContent = iplocal
    //     document.querySelector('[data-ip]').setAttribute('data-ip', iplocal)
    //     return ip
    // })
}

const three =()=>{
    return fetch('https://picsum.photos/40/40').then( res => {
        document.getElementById('image').src       = res.url
        return res.url
    })
}

Promise.all( [ one(), two(), three() ] ).then( res => {
    const iplocal = `${res[1]}:4445`
    
    const emit = {
        header : {
            ip : res[0]
        },
        body   : {
            ip     : iplocal,
            image  : res[2],
        }
    }

    const socket    = io('https://l8qn2l7t-5001.brs.devtunnels.ms/');

    socket.on('connect', ()=> {

        socket.emit('connect-list', JSON.stringify(emit))
        
    })

    socket.on('connect-list', (data)=> {

        const datas = JSON.parse(data)
        document.getElementById('datas').innerHTML = datas.map( data => {
            
            if( data.id == socket.id ) return ''
            if( data.data.header.ip != res[0] ) return ''

            return `
                <div class="div_557EbR4">
                    <div class="div_6pxFPgJ">
                        <img src="${ data.data.body.image }" alt="">
                        <p>${ data.data.body.ip }</p>  
                    </div>
                    <div class="div_VWyUlPI" data-ip="${ data.data.body.ip }">
                        <button class="button_x7jX1VV two" data-action="play">${ icon.get('fi fi-rr-play') }</button>
                        <button class="button_x7jX1VV two" data-action="open">${ icon.get('fi fi-rr-expand-arrows') }</button>
                        <button class="button_x7jX1VV two" data-action="copy">${ icon.get('fi fi-rr-copy') }</button>
                        <button class="button_x7jX1VV two" data-action="share">${ icon.get('fi fi-rr-share') }</button>
                    </div>
                </div>
            `
        }).join('')
    })
})



const prueba =()=>{
    return getLIP().then( ip => {
        // const iplocal = `${ip}:4445`
        // document.getElementById('ipl').textContent = iplocal
        // document.querySelector('[data-ip]').setAttribute('data-ip', iplocal)
        // document.getElementById('test')

        document.getElementById('test').textContent = 'tu ip ' + ip

        //return ip
    })
}

prueba()


