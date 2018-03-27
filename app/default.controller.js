angular
.module('app')
.controller('Navbar', function (UserService) {
    var vm = this;
    vm.currentUser = {};
    UserService.GetCurrent()
        .then(function (data) {
            if (data)
                vm.currentUser = data;
        })
        .catch(function(err) {
            console.log(err);
        })
})