var template; 
$.get('/templates/row.hbs', function(data){
    template = Handlebars.compile(data);
}, 'html');

var socket = io.connect('http://localhost:4000');

Handlebars.registerHelper('human_time', function(timestamp){
  return moment.unix(timestamp).fromNow();
});

$('#start').click(function(){

    var tag = $('#tag').val();

    $.post(
        '/tag/subscribe',
        {
            'tag': tag
        },
        function(response){
            
            if(response.type == 'success'){   
                $('#form-wrapper').addClass('hidden');
                $('#results').removeClass('hidden');
            }    
                
        }
    )
});


socket.on('new_photo', function(data){
    
    $.imgpreload(data.image, function()
    {
        console.log('loaded a new image');

        var first_row = $('#wrapper .row:first');
        var html = template(data);

        $.backstretch(data['image']);

        var vague = $('.backstretch').Vague({
            intensity: 10,     
            forceSVGUrl: false
        });     

        vague.blur();           

        $(html).hide().insertBefore(first_row).fadeIn('slow');

        $('#wrapper .row:last').remove();

    });

});