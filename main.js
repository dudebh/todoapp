const baseUrl = 'https://besttodoappever-server.herokuapp.com';

function onSignIn(googleUser) {
    console.log('masuk login google');
    var id_token = googleUser.getAuthResponse().id_token;
    $.ajax({
        url: baseUrl+'/googlelogin',
        method: 'POST',
        data: {
            idToken: id_token
        }
    }).done(data =>{
        console.log(data);
        console.log('berhasil');
        localStorage.setItem('access_token', data.access_token)
        showHome()
    }).fail(xhr=>{
        console.log('gagal');
        console.log(xhr);
    })
}

$(document).ready(()=>{    
    if(localStorage.getItem('access_token')){
        showHome()
    }else{
        showLogin()
    }
    
    $('#button-logout').click(()=>{
        localStorage.clear();
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut()
        showLogin();
    });

    $('#btnAdd').click(()=>{
        showFormAdd()
    })

    $(document).on('click',"#btnDelete", function(){
        deleteTodo($(this).data("value"))
         
    });

    $(document).on('click',"#btnChangeStatus", function(){
        patchTodo($(this).data("value"), $(this).data("status"))
         
    });

    $(document).on('click',"#btnEdit", function(){
        showFormEditTodo($(this).data("value"))
         
    });

    $('#login-form').submit((event)=>{
        event.preventDefault(); //biar gak menjalankan event default dari form
        const email = $('#email').val();
        const password = $('#password').val();

        $.ajax({
            url: `${baseUrl}/login`,
            method: 'POST',
            data: {
                email, password
            }
        }).done(data =>{
            console.log(data);
            localStorage.setItem('access_token', data.access_token)
            
            showHome()
            $('#email').val('');
            $('#password').val('');
        }).fail(xhr=>{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: xhr.responseJSON.message,
              })
        })
    })

    $('#form-add').submit((event)=>{
        event.preventDefault(); //biar gak menjalankan event default dari form
        const title = $('#title').val();
        const description = $('#description').val();
        const status = $('#status').val();
        const due_date = $('#due_date').val();

        $.ajax({
            url: `${baseUrl}/todo`,
            method: 'POST',
            data: {
                title, description, status, due_date
            },
            headers: {
                access_token: localStorage.getItem('access_token')
            }
        }).done(data =>{
            console.log(data);
            showHome()
        }).fail(xhr=>{
            console.log(xhr);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: xhr.responseJSON.message,
              })
        })
    })

    $('#form-edit').submit((event)=>{
        event.preventDefault(); //biar gak menjalankan event default dari form
        const title = $('#title-edit').val();
        const description = $('#description-edit').val();
        const status = $('#status-edit').val();
        const due_date = $('#due_date-edit').val();
        const id = $('#id-edit').val();

        $.ajax({
            url: `${baseUrl}/todo/${id}`,
            method: 'PUT',
            data: {
                title, description, status, due_date
            },
            headers: {
                access_token: localStorage.getItem('access_token')
            }
        }).done(data =>{
            showHome()
        }).fail(xhr=>{
            console.log(xhr);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: xhr.responseJSON.message,
              })
        })
    })

})

function register(event){
    event.preventDefault();
    const email = $('#email-reg').val();
    const password = $('#password-reg').val();

    $.ajax({
        url: `${baseUrl}/register`,
        method: 'POST',
        data: {
            email, password
        }
    }).done(data =>{
        showLogin();
        Swal.fire(
            'Good job!',
            'Now you have to login!',
            'success'
        )
        $('#email-reg').val('');
        $('#password-reg').val('');
    }).fail(xhr=>{
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: xhr.responseJSON.message,
          })
        console.log(xhr);
    })
}

function randomTodo(){
    let type = $('#type').val();
    $.ajax({
        url: `${baseUrl}/todo/suggest?type=${type}`,
        method: 'GET',
        headers: {
            access_token: localStorage.getItem('access_token')
        }
    }).done(data =>{
        $('#title').val(data.activity)
    }).fail(xhr=>{
        console.log(xhr);
    })
}

function clearLogedPage(){
    $('main').hide();
    $('section').hide();
}
  
function showHome(){
    clearLogedPage()
    $('#loged-page').show();
    $('#home-page').show();
    $('#todo').empty();
    getTodo()
}

function showLogin(){
    $('section').hide();
    $('#register').hide();
    $('#login-page').show();
    $('#login').show();
}

function showRegister(event){
    event.preventDefault()
    $('#login').hide();
    $('#register').show();
}

function showFormAdd(){
    $('main').hide();
    $('#add-page').show();
}

function deleteTodo(id){
    $.ajax({
        url: `${baseUrl}/todo/${id}`,
        method: 'DELETE',
        headers: {
            access_token: localStorage.getItem('access_token')
        }
    }).done(data =>{
        showHome()
    }).fail(xhr=>{
        console.log(xhr);
    })
}

function patchTodo(id, status){
    $.ajax({
        url: `${baseUrl}/todo/${id}`,
        method: 'PATCH',
        headers: {
            access_token: localStorage.getItem('access_token')
        },
        data: {
            status
        }
    }).done(data =>{
        showHome()
    }).fail(xhr=>{
        console.log(xhr);
    })
}

function showFormEditTodo(id){
    $.ajax({
        url: `${baseUrl}/todo/${id}`,
        method: 'GET',
        headers: {
            access_token: localStorage.getItem('access_token')
        }
    }).done(data =>{
        $('main').hide();
        $('#edit-page').show();
        $('#title-edit').val(data.title)
        $('#description-edit').val(data.description)
        $('#status-edit').val(data.status)
        $('#due_date-edit').val(data.due_date.substring(0, 10))
        $('#id-edit').val(data.id)

    }).fail(xhr=>{
        console.log(xhr);
    })
}



function getTodo(){
    $.ajax({
        url: baseUrl+'/todo',
        method: 'GET',
        headers: {
            access_token: localStorage.getItem('access_token')
        }
    }).done(data=>{
        data.forEach(e=>{
            let color = '#e67d26'
            let btColor = '#00ac96'
            let btnSts = 'Complete'
            if(e.status === 'Complete'){
                color = '#00ac96'
                btnSts = 'Incomplete'
                btColor = '#e67d26'
            }
            $('#todo').append(`
            <div class="card" style="width: 18rem;display: inline-block;">
                <div class="card-header" style="background-color: ${color};">
                    Status : ${e.status}
                    <button type="button" data-value="${e.id}" class="float-end btn-close" aria-label="Close" id="btnDelete"></button>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${e.title}</h5>
                    <p class="card-text">${e.description}</p>
                    <p class="card-text">${e.due_date}</p>
                    <a class="btn" id="btnChangeStatus" data-value="${e.id}" data-status="${btnSts}" style="background-color: ${btColor};">${btnSts}</a>
                    <button class="btn btn-class" data-value="${e.id}" id="btnEdit">Edit</button>
                </div>
            </div>
            `)
        })
    }).fail(xhr=>{
        console.log(xhr);
    })
}
