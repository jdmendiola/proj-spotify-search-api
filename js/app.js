let app = (function(){

    let SpotifySearch = {

        welcomeMessage: $("#albums li.desc"),

        searchForm: $("#submit"),

        albumData: [],

        init: function(){
            this.searchForm.on("click", this.searchHandler.bind(this));
        },

        searchHandler: function(e){

            e.preventDefault();

            this.handleResults();

            this.welcomeMessage.hide();

            if ($("#search").val() !== ""){
                $.ajax({
                    url: "https://api.spotify.com/v1/search",
                    data: {
                        q: $("#search").val(),
                        type: "album"
                    },
                    success: function(response){
                        console.log("success jqXHR", response);
                        SpotifySearch.handleData(response);
                    }
                });
            } else {
                console.log("Error");
                SpotifySearch.handleNoResults(true);
            }
        },

        handleData: function(response){

            let albumItems = response.albums.items;

            if (albumItems.length !== 0){

                for(let albumData = 0; albumData < albumItems.length; albumData++){

                    let albumId = albumItems[albumData].id;
                    let albumArtist = albumItems[albumData].artists[0].name;
                    let albumTitle = albumItems[albumData].name;
                    let albumURL = albumItems[albumData].external_urls.spotify;
                    let imgURL = albumItems[albumData].images[0].url;
                    let liResults = `
                        <li>
                            <div class="album-wrap">
                                <a href="${albumURL}" target="_blank">
                                    <img class="album-art" src="${imgURL}">
                                </a>
                            </div>
                            <span class="album-title" data-id="${albumId}">${albumTitle}</span>
                            <span class="album-artist">${albumArtist}</span>
                        </li>
                    `;

                    $("#albums").append(liResults);
                }

                SpotifySearch.handleAlbumTitle();

            } else {
                SpotifySearch.handleNoResults();
            }

        },

        handleAlbumTitle: function(){
            $("#albums li").on("click", "span.album-title", this.getAlbumDetails);
        },

        getAlbumDetails: function(){

            let albumId = $(this).data("id");
            let albumIndex = $("#albums li").index($(this).parent("li"));

            $.ajax({
                url: "https://api.spotify.com/v1/albums/" + albumId,
                success: function(response){
                    SpotifySearch.handleAlbumDetails(response, albumIndex);
                }
            });

        },

        handleAlbumDetails: function(album, index){

            console.log(album, index);
            let albumTitle = album.name;
            let albumArtist = album.artists[0].name;
            let albumArt = album.images[0].url;
            let albumReleaseDate = album.release_date.substring(0, 4);

            function albumData(title, artist, art, date, tracks = []){
                this.title = title;
                this.artist = artist;
                this.art = art;
                this.date = date;
                this.tracks = tracks
            }

            let dataObj = new albumData(albumTitle, albumArtist, albumArt, albumReleaseDate);

            SpotifySearch.albumData[index] = dataObj;

            console.log(SpotifySearch.albumData);

        },

        handleNoResults: function(failure = false){

            let searchValue = failure ? "blank search query" : $("#search").val();
            let liResults = `
                <li class='no-albums desc'>
                  <i class='material-icons icon-help'>help_outline</i>No albums found that match: ${searchValue}
                </li>
            `;

            $("#albums").append(liResults);

        },

        handleResults: function(){

            let liResults = $("#albums li");

            liResults.each(function(){
                $(this).remove();
            });

        }

    } // end

    return SpotifySearch;

}());

$(function(){

    app.init();

});
