require("dotenv").config();

// Node module imports needed to run the functions
var fs = require("fs"); //reads and writes files
var request = require("request");
var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var liriArgument = process.argv[2];

// Possible commands for this liri app
switch (liriArgument) {
  case "my-tweets":
    myTweets();
    break;
  case "spotify-this-song":
    spotifyThisSong();
    break;
  case "movie-this":
    movieThis();
    break;
  case "do-what-it-says":
    doWhatItSays();
    break;
  // Instructions displayed in terminal to the user
  default:
    console.log(
      "\r\n" +
        "Hello. Welcome to Luke's Liri App. Try typing one of the following commands after 'node liri.js' : " +
        "\r\n" +
        "1. my-tweets 'any twitter name' " +
        "\r\n" +
        "2. spotify-this-song 'any song name' " +
        "\r\n" +
        "3. movie-this 'any movie name' " +
        "\r\n" +
        "4. do-what-it-says." +
        "\r\n" +
        "Be sure to put the movie or song name in quotation marks if it's more than one word."
    );
}

// Functions
// Movie function, uses the Request module to call the OMDB api
function movieThis(movieTitle) {
	// Runs a request to the OMDB API with the movie specified.
	var movieTitle = process.argv[3];
  var queryUrl =
    "http://www.omdbapi.com/?t=" +
    movieTitle +
    "&y=&plot=short&apikey=trilogy&r=json";

  request(queryUrl, function(error, response, body) {
    // If the request is successful...
    if (!error && response.statusCode === 200) {
      // Parses the body of the site and recovers movie info.
      var movie = JSON.parse(body);

      // Prints out movie info.
      console.log("Movie Title: " + movie.Title);
      console.log("Release Year: " + movie.Year);
      console.log("IMDB Rating: " + movie.imdbRating);
      console.log("Country Produced In: " + movie.Country);
      console.log("Language: " + movie.Language);
      console.log("Plot: " + movie.Plot);
      console.log("Actors: " + movie.Actors);

      // Had to set to array value, as there seems to be a bug in API response,
      // that always returns N/A for movie.tomatoRating.
      console.log("Rotten Tomatoes Rating: " + movie.tomatoRating);
      console.log("Rotten Tomatoes URL: " + movie.tomatoURL);
    }
  });
}
// Tweet function, uses the Twitter module to call the Twitter api
function myTweets() {
	var client = new Twitter({
		consumer_key: keys.twitter.consumer_key,
		consumer_secret: keys.twitter.consumer_secret,
		access_token_key: keys.twitter.access_token_key,
		access_token_secret: keys.twitter.access_token_secret,
	});
	var twitterUsername = process.argv[3];
	if (!twitterUsername) {
		twitterUsername = "lubepp";
	}
	params = { screen_name: twitterUsername };
	client.get("statuses/user_timeline/", params, function (error, data, response) {
		if (!error) {
			for (var i = 0; i < data.length; i++) {
				//console.log(response); // Show the full response in the terminal
				var twitterResults =
					"@" + data[i].user.screen_name + ": " +
					data[i].text + "\r\n" +
					data[i].created_at + "\r\n" +
					"------------------------------ " + i + " ------------------------------" + "\r\n";
				console.log(twitterResults);
				log(twitterResults); // calling log function
			}
		} else {
			console.log("Error :" + error);
			return;
		}
	});
}

// Do What It Says function, uses the reads and writes module to access the random.txt file and do what's written in it
function doWhatItSays() {
  fs.readFile("random.txt", "utf8", function(error, data) {
    if (!error) {
      doWhatItSaysResults = data.split(",");
      spotifyThisSong(doWhatItSaysResults[0], doWhatItSaysResults[1]);
    } else {
      console.log("Error occurred" + error);
    }
  });
}
// Do What It Says function, uses the reads and writes module to access the log.txt file and write everything that returns in terminal in the log.txt file
function log(logResults) {
  fs.appendFile("log.txt", logResults, error => {
    if (error) {
      throw error;
    }
  });
}
// Spotify function, uses the Spotify module to call the Spotify api
function spotifyThisSong(songName) {
  var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
  });
  var songName = process.argv[3];
  if (!songName) {
    songName = "The Sign";
  }
  spotify.search({ type: "track", query: songName }, function(err, data) {
    if (err) {
      return console.log("Error occurred: " + err);
    }
    console.log(data);
  });
  params = songName;
  spotify.search({ type: "track", query: params }, function(err, data) {
    if (!err) {
      var songInfo = data.tracks.items;
      for (var i = 0; i < 5; i++) {
        if (songInfo[i] != undefined) {
          var spotifyResults =
            "Artist: " +
            songInfo[i].artists[0].name +
            "\r\n" +
            "Song: " +
            songInfo[i].name +
            "\r\n" +
            "Album the song is from: " +
            songInfo[i].album.name +
            "\r\n" +
            "Preview Url: " +
            songInfo[i].preview_url +
            "\r\n" +
            "------------------------------ " +
            i +
            " ------------------------------" +
            "\r\n";
          console.log(spotifyResults);
          log(spotifyResults); // calling log function
        }
      }
    } else {
      console.log("Error :" + err);
      return;
    }
  });
}
