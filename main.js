const apiAddress = "https://bruhfeefee.pythonanywhere.com/api/"

data = {}

window.onload = function(){
    var source = document.getElementById('file');
    MidiParser.parse(source, function(obj){
        console.log(obj);
        tracks = obj.tracks;
        if (tracks != 1){
            displayError("Midi file has too many tracks.");
            return;
        }
        events = obj.track[0].event; 
        time = 0
        notes = []
        for(let i = 0; i<events.length;i++){
            e = events[i];
            console.log(e)
            type = e.type;
            if (type == 9 && e.data[1] > 0){
                note = {
                   'midi':e.data[0],
                   'time':time
                }
                notes.push(note);
            }

            time+=e.deltaTime;
        }

        data['notes'] = notes;

        console.log(data);
    });
};

function displayError(message){
    console.log(message);
    $('#alert').removeClass("alert-success");
    $("#alert").addClass("alert-danger");
    $("#alertText").text(message);
    $('#player').addClass("d-none");
    $("#collapser").collapse("show");
}

function requestCountermelody(){

    queryData = {
        'minor':    minor =  $("#minor").prop('checked') ? 1 : 0,
        'tempo': $("#tempo").val(),
        'key': $("#key").val(),
        'species':$("#species").val(),
        'notes':btoa(JSON.stringify(data['notes']))
    }

    querystring = '?';
    keys = Object.keys(queryData);
    for(let i = 0; i< keys.length; i++){
        key = keys[i];
        value = queryData[key];
        querystring+=key+"="+value+"&";
    }

    querystring=querystring.substring(0,querystring.length-1);

	fetch(apiAddress+"countermelody"+querystring, { method: 'GET', mode: 'cors' }).then(function(response){
		if(response.status !== 200){
            displayError(response.message);
			return;
		}
		response.json().then(function(data){
			stem = "data:;base64,";
			$("#player").attr("src",stem+data['data']);
            $('#alert').removeClass("alert-danger");
            $("#alert").addClass("alert-success");
            $("#alertText").text("Countermelody generated!");
            $('#player').removeClass("d-none");
            $("#collapser").collapse("show");
		});
	}).catch(function(error){
        displayError(error);
        return;
	});
}

function tryUnlockSubmit(){
    key = $("#key").val();
    tempo = $("#tempo").val();
    file = $("#file").val();
    species =  $("#species").val();
    console.log(file);
    console.log(key)
    console.log(species)
    if (!tempo){
        console.log("tempo");
        $("#submit").prop("disabled",true);

        return false;
    }

    if (key==-1){
        console.log("key");
        $("#submit").prop("disabled",true);

        return false;
    }

    if(file==''){
        console.log("file");
        $("#submit").prop("disabled",true);

        return false;
    }

    if (species==-1){
        console.log("species");
        $("#submit").prop("disabled",true);

        return false;
    }

    $("#submit").prop("disabled",false);
}

function submitFile(){
    requestCountermelody();
}

function init(){
    
}

$(document).ready(init);

$("#key").change(tryUnlockSubmit);
$("#tempo").change(tryUnlockSubmit);
$("#file").change(tryUnlockSubmit);
$("#species").change(tryUnlockSubmit);

$("#submit").click(function(event){
    event.preventDefault();
    requestCountermelody();
});