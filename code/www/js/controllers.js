angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $ionicLoading, $timeout, User, Recommendations) {
  // helper functions for loading
  var showLoading = function(){
    $ionicLoading.show({
      template: '<i class="ion-loading-c"></i>',
      noBackdrop: true
    });
  };

  var hideLoading = function(){
    $ionicLoading.hide();
  };

  // set loading to true first time while we retrieve songs from server
  showLoading();


  // get our first songs
  Recommendations.init()
    .then(function(){

      $scope.currentSong = Recommendations.queue[0];

      return Recommendations.playCurrentSong();
    })
    .then(function(){
      // turn loading off
        hideLoading();
        $scope.currentSong.loaded = true;
    });

    // fired when we favorite / skips a song
      $scope.sendFeedback = function(bool){

        // first, add to favorites if they favorited
        if(bool) User.addSongToFavorites($scope.currentSong);
        //set variable for the correct animation sequence
        $scope.currentSong.rated = bool;
        $scope.currentSong.hide = true;

        // prepare the next song
        Recommendations.nextSong();

        // update current song in scope, timeout to allow animation to complete
        $timeout(function(){
          //$timeout to allow animation to complete
          $scope.currentSong = Recommendations.queue[0];
        }, 250);

        Recommendations.playCurrentSong().then(function(){
          $scope.currentSong.loaded = true;
        });
      };

    $scope.nextAlbumImg = function(){
      if(Recommendations.queue.length > 1){
        return Recommendations.queue[1].image_large;
      }
      return '';
    };

  })


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User, $window) {
  //get the list of our favorites from the user service
  $scope.favorites = User.favorites;

  $scope.removeSong = function(song,index){
    User.removeSongFromFavorites(song,index);
  };

  $scope.openSong = function(song){
    $window.open(song.open_url,"_system");
  };

})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, User, Recommendations) {
  // stop audio when going to favorites page
  $scope.favCount = User.favoriteCount;

  $scope.enteringFavorites = function() {
    Recommendations.haltAudio();
    User.newFavorites = 0;
  };

  $scope.leavingFavorites = function(){
    Recommendations.init();
    // expose the number of new favorites to the scope
  };
})

.controller('SplashCtrl', function($scope, User, $state){

  // attempt to signup/login via User.auth
  $scope.submitForm = function(username, signingUp) {
    User.auth(username, signingUp).then(function() {
      //session is now set, so let's redirect to discover page
      $state.go('tab.discover');

    }, function() {
      //error handling
      alert('Hmm... try another username.');
    });
  };
});
