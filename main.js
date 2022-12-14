const apiAddress = "https://bruhfeefee.pythonanywhere.com/api/"

data = {}
manyTracks = false;
invalid = false;

window.onload = function(){

    styleDemoPlayer();
    initParser();

    $("#closebutton").click(closeHelp);
    $("#helpscreen").click(closeHelp);
    $("#help-text-container").click(e=>{e.stopPropagation();});
    $("#helpbutton").click(openHelp);
    $("#demolink").click(startDemo);
};

function startDemo(){
    
    fetch('./pachelbel.mid')
        .then(res=>res.blob())
        .then(blob=>{
            var dt = new DataTransfer();
            var demofile = new File([blob], "pachelbel.mid");
            dt.items.add(demofile);
            document.querySelector("#file").files = dt.files;

            var reader = new FileReader();
            reader.readAsDataURL(demofile);
            reader.onload = function(){
                base64data = reader.result;
                base64data = base64data.substr(base64data.indexOf(',')+1);
                parseMidi(MidiParser.parse(base64data));
            };

        }).then(()=>{
            $("#filelabel").text("pachelbel.mid");
            $("#key").val(2);
            $("#minor").prop('checked', false);
            $("#species").val(3);
            $("#tempo").val(120);
            
            tryUnlockSubmit();
            closeHelp();
        })
}

function openHelp(){
    $("#helpscreen").removeClass("d-none");
}

function initParser(){
    var source = document.getElementById('file');
    MidiParser.parse(source, parseMidi);
}

function parseMidi(obj){

    tracks = obj.tracks;
    if (tracks != 1){
        if(tracks == null){
            invalid = true;
            manyTracks= false;
        }else{
            manyTracks=true;
            invalid=false;
        }
        return;
    }else{
        manyTracks=false;
        invalid=false;
    }
    events = obj.track[0].event; 
    time = 0
    notes = []
    for(let i = 0; i<events.length;i++){
        e = events[i];
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
}

function closeHelp(){
    $("#helpscreen").addClass("d-none");
}

function styleDemoPlayer(){
    var style = document.createElement("link");
    $(style).attr("rel", "stylesheet");
    $(style).attr("href", "demoplayer.css");
    $("#demoplayer")[0].shadowRoot.appendChild(style);
}

function displayError(message){
    $('#alert').removeClass("alert-success");
    $("#alert").addClass("alert-danger");
    $("#alertText").text(message);
    $('#player').addClass("d-none");
    $("#collapser").fadeIn();
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
            response.json().then(function(data){
                displayError(data.message.toLowerCase());
            });
			return;
		}
		response.json().then(function(data){
			stem = "data:;base64,";
			$("#player").attr("src",stem+data['data']);
            $('#alert').removeClass("alert-danger");
            $("#alert").addClass("alert-success");
            $("#alertText").text("Countermelody generated!");
            $('#player').removeClass("d-none");
            $("#collapser").fadeIn();
		});
	}).catch(function(error){
        displayError(error);
	});
}

function tryUnlockSubmit(){
    key = $("#key").val();
    tempo = $("#tempo").val();
    file = $("#file").val();
    species =  $("#species").val();
    if (!tempo){
        $("#submit").prop("disabled",true);

        return false;
    }

    if (key==-1){
        $("#submit").prop("disabled",true);

        return false;
    }

    if(file==''){
        $("#submit").prop("disabled",true);

        return false;
    }

    if (species==-1){
        $("#submit").prop("disabled",true);

        return false;
    }

    $("#submit").prop("disabled",false);
}

function submitFile(){
    requestCountermelody();
}

$("#key").change(tryUnlockSubmit);
$("#tempo").change(tryUnlockSubmit);
$("#file").change(function(){
    var f = $('#file')[0].files[0];
    if (f){
        $("#filelabel").text(f.name);
    }

    tryUnlockSubmit();
});
$("#species").change(tryUnlockSubmit);


$("#submit").click(function(event){
    event.preventDefault();
    if (manyTracks){
        displayError("midi file has too many tracks.");
    }else if (invalid){
        displayError('a valid midi file was not uploaded.');
    }else{
        requestCountermelody();
    }
});