let app = (function(){

    let SpotifySearch = {

        welcomeMessage: $("#albums li.desc"),

        searchForm: $("#submit"),

        backSearchButton: $(".back-to-search"),

        albumData: [],

        init: function(){
            this.searchForm.on("click", this.searchHandler.bind(this));
            this.backSearchButton.on("click", this.backSearchHandler.bind(this));
        },

        backSearchHandler: function(){
            $(".main-content").removeClass("hide");
            $(".album-details").removeClass("hide");
            $(".album-details").addClass("hide");
            this.handleTrackResults();
        },

        searchHandler: function(e){

            e.preventDefault();

            this.handleResults();

            this.handleTrackResults();

            this.welcomeMessage.hide();

            this.albumData.length = 0;

            $(".main-content").removeClass("hide");
            $(".album-details").removeClass("hide");
            $(".album-details").addClass("hide");

            if ($("#search").val() !== ""){
                $.ajax({
                    url: "https://api.spotify.com/v1/search",
                    data: {
                        q: $("#search").val(),
                        type: "album"
                    },
                    success: function(response){
                        //console.log("success jqXHR", response);
                        SpotifySearch.handleData(response);
                    }
                });
            } else {
                //console.log("Error");
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
                    //let albumURL = albumItems[albumData].external_urls.spotify;
                    let imgURL = albumItems[albumData].images[0].url;
                    let liResults = `
                        <li>
                            <div class="album-wrap">
                                <img class="album-art" src="${imgURL}">
                            </div>
                            <span class="album-title" data-id="${albumId}">${albumTitle}</span>
                            <span class="album-artist">${albumArtist}</span>
                        </li>
                    `;
                    // <a href="${albumURL}" target="_blank">
                    //     <img class="album-art" src="${imgURL}">
                    // </a>
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

            if (SpotifySearch.albumData[albumIndex] == undefined){

                $.ajax({
                    url: "https://api.spotify.com/v1/albums/" + albumId,
                    success: function(response){
                        console.log(response);
                        SpotifySearch.handleAlbumDetails(response, albumIndex);
                        SpotifySearch.loadAlbumDetails(albumIndex);
                    }
                });

            } else {
                SpotifySearch.loadAlbumDetails(albumIndex);
                console.log("This particular album data has already been saved. Let's not spam Spotify :)");
            }

        },

        handleAlbumDetails: function(album, albumIndex){
            let albumTitle = album.name;
            let albumArtist = album.artists[0].name;
            let albumArt = album.images[0].url;
            let albumReleaseDate = album.release_date.substring(0, 4);
            let albumTracks = album.tracks.items;
            let albumURL = album.external_urls.spotify;

            function albumData(title, artist, art, date, tracks, url){
                this.title = title;
                this.artist = artist;
                this.art = art;
                this.date = date;
                this.tracks = tracks;
                this.url = url;
            }

            let albumDataObj = new albumData(
                albumTitle,
                albumArtist,
                albumArt,
                albumReleaseDate,
                albumTracks,
                albumURL);

            SpotifySearch.albumData[albumIndex] = albumDataObj;

        },

        loadAlbumDetails: function(albumIndex){

            $(".main-content").toggleClass("hide");
            $(".album-details").toggleClass("hide");

            let pageAlbumTitle = $(".album-details h1");
            let pageAlbumArtist = $(".album-details h4");
            let pageAlbumImg = $(".album-img img");

            let albumData = SpotifySearch.albumData[albumIndex];

            console.log(albumData);

            pageAlbumImg.attr("src", albumData.art);
            pageAlbumTitle.text(`${albumData.title} (${albumData.date})`);
            pageAlbumTitle.wrap(`<a target="_blank" href="${albumData.url}"></a>`)
            pageAlbumArtist.text(albumData.artist);

            //load tracks
            for (let i = 0; i < albumData.tracks.length; i++){
                let trackNo = albumData.tracks[i].track_number;
                let trackName = albumData.tracks[i].name;
                let trackLi = `
                    <li>${trackNo}. ${trackName}</li>
                `;
                $(".album-tracks").append(trackLi);
            }

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

        },

        handleTrackResults: function(){

            let trackLists = $(".album-tracks li");

            trackLists.each(function(){
                $(this).remove();
            });
        }

    } // end

    return SpotifySearch;

}());

$(function(){

    app.init();

});
