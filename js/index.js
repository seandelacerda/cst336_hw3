$(document).ready(function() {
    // show name and hide location and character inputs by default
    $("#locationInput").hide();
    $("#characterInput").hide();
    $("#image").hide();
    
    
    // get locations onload
    getLocationOptions();
    
    // display appropriate search based on radio selection
    $('input[type=radio][name=searchBy]').change(function() {
        if (this.value == 'episode') {
            $("#episodeInput").show();
            $("#searchEpisode").show();
            $("#locationInput").hide();
            $("#characterInput").hide();
        }
        else if (this.value == 'location') {
            $("#locationInput").show();
            $("#characterInput").show();
            $("#episodeInput").hide();
            $("#searchEpisode").hide();
        }
        $("#image").hide();
    });
    
    // helper function to fetch api results
    async function getData(url) {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    }
    
    async function getAllLocations() {
        let url = 'https://rickandmortyapi.com/api/location';
        let results = [];
        let page = await getData(url);
        
        // get all pages from paginated endpoint
        do {
            page = await getData(url);
            results = results.concat(page.results);
            url = page.info.next;
        } while (page.info.next);
        
        return results;
    }
    
    // get location dropdown options
    async function getLocationOptions() {
        let results = await getAllLocations();
        let characters = [];

        if (results) {
            results.forEach(function(i) {
                $("#location").append(`<option value="${i.name}"> ${i.name} </option>`);
            });
        }
        
        let location = $("#location").val();
        
        await getCharacters('location', location);
    }
    
    async function getCharacters(type, source) {
        if (type == 'episode') {
            let url = `https://rickandmortyapi.com/api/episode/${source}`;
            let response = await fetch(url);
            let data = await response.json();
    
            let result = data.characters || null;
            
            if (result) {
                $("#character").empty();
                let character;
                for (char of result) {
                    character = await getData(char);
                    $("#character").append(`<option value="${character.id}"> ${character.name} </option>`);
                }
            }
            $("#characterInput").show();
        } else if (type == 'location') {
            let url = `https://rickandmortyapi.com/api/location/?name=${source}`;
            let response = await fetch(url);
            let data = await response.json();
            
            let result = (data.results && data.results[0]) ? data.results[0] : null;
            
            if (result && result.residents.length) {
                $("#character").empty();
                let character;
                for (resident of result.residents) {
                    character = await getData(resident);
                    $("#character").append(`<option value="${character.id}"> ${character.name} </option>`);
                }
            }
        }
    }
    
    $("#searchEpisode").on("click", async function() {
        let episode = Number($("#episode").val());
        
        if (!Number.isInteger(episode) || episode < 1 || episode > 41) {
            $("#episodeError").html("Episode must be an integer between 1-41");
            $("#episodeError").css("color", "red");
            
            return;
        }
        
        await getCharacters('episode', episode);
    });
    
    $("#location").on("change", async function() {
        let location = $("#location").val();
        
        await getCharacters('location', location);
    });
    
    // display character on submit
    $("#searchForm").on("submit", async function() {
        event.preventDefault();
        let character = $("#character").val();
        let url = `https://rickandmortyapi.com/api/character/${character}`;
        let result = await getData(url);
        
        $("#image").attr("src",`${result.image}`);
        $("#image").attr("alt",`Picture of ${result.name}`);
        $("#imageCaption").text(result.name);
        $("#status").text(`Status: ${result.status}`);
        $("#species").text(`Species: ${result.species}`);
        $("#gender").text(`Gender: ${result.gender}`);
        $("#image").show();
    });
});
