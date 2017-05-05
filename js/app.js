let app = (function(){

    let SpotifySearch = {

        searchForm: $("#submit"),

        searchHandler: function(e){
            e.preventDefault();
            $.ajax({
                url: "https://api.spotify.com/v1/search",
                data: {
                    q: $("#search").val(),
                    type: "album"
                },
                success: function(response){
                    console.log(this);
                    $("#albums li.desc").hide();
                    SpotifySearch.handleData(response);
                },
                error: function(){
                    alert('fail search');
                }
            });
        },

        handleData: function(response){

            let albumItems = response.albums.items;
            console.log($(albumItems));

            for(let albumData = 0; albumData < albumItems.length; albumData++){

                let albumArtist = albumItems[albumData].artists[0].name;
                let albumTitle = albumItems[albumData].name;
                let imgURL = albumItems[albumData].images[0].url;
                let liResults = `
                    <li>
                        <div class="album-wrap">
                            <img class="album-art" src="${imgURL}">
                        </div>
                        <span class="album-title">${albumTitle}</span>
                        <span class="album-artist">${albumArtist}</span>
                    </li>
                `;

                $("#albums").append(liResults);

            }
        },

        init: function(){
            console.log("fire");
            this.searchForm.on("click", this.searchHandler.bind(this));
        }


    } // end

    return SpotifySearch;

}());

$(function(){

    app.init();

});
