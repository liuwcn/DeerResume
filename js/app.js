var siteTitle = "个人简历";//默认网站title，会根据简历标题自动修改
var baseurl = 'http://liuw.vip/life/resume';
// var baseurl = 'data.php'; // 使用本地文件托管简历数据，本地模式下，不支持在线编辑

var deerResume = angular.module('deerResume', ['ngRoute', 'wiz.markdown', 'ngNotify', 'angularLocalStorage']);

deerResume.controller('rootCtrl', function ($scope) {
  $scope.siteTitle = siteTitle;
  $scope.$on('seSiteTitle', function (e, newSiteTitle) {
    $scope.siteTitle = newSiteTitle;
  });
});

function getDomain(origin) {
  var domain = window.location.origin + window.location.pathname;
  return origin ? domain : encodeURIComponent(domain);
}

deerResume.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/admin', {
      templateUrl: 'admin.html',
      controller: 'adminCtrl'
    }).when('/resume', {
      templateUrl: 'resume.html',
      controller: 'resumeCtrl'
    }).otherwise({
      redirectTo: '/resume'
    });
  }]);


deerResume.controller('resumeCtrl', function ($scope, $http, storage) {

  storage.bind($scope, 'vpass');

  var url = '';
  if ($scope.vpass && $scope.vpass.length > 3)
    url = baseurl + "?domain=" + getDomain() + "&vpass=" + encodeURIComponent($scope.vpass);
  else
    url = baseurl + "?domain=" + getDomain();


  $http.get(url).success(function (data) {
    $scope.resume = data;
    $scope.$emit('seSiteTitle', data.title);
  });


  $scope.password = function (vpass) {
    $scope.vpass = vpass;
    window.location.reload();
  }

});

deerResume.controller('adminCtrl', function ($scope, $http, storage, ngNotify, $rootScope) {

  storage.bind($scope, 'wpass');
  storage.bind($scope, 'vpass');
  storage.bind($scope, 'apass');
  storage.bind($scope, 'resume.content');

  var url = '';
  if ($scope.vpass && $scope.vpass.length > 3)
    url = baseurl + "?domain=" + getDomain() + "&vpass=" + encodeURIComponent($scope.vpass);
  else
    url = baseurl + "?domain=" + getDomain();

  $http.get(url).success(function (data) {
    console.log(data);
    var oldcontent = $scope.resume.content;
    $scope.resume = data;
    $rootScope.siteTitle = data.title;
    $scope.resume.adminPassword = $scope.apass;
    $scope.resume.viewPassword = $scope.wpass;
    if (oldcontent.length > 0) $scope.resume.content = oldcontent;
  });

  $scope.save = function (item) {
    $http
    ({
      method: 'POST',
      url: baseurl,
      data: {
        'domain': getDomain(true),
        'title': item.title,
        'subTitle': item.subTitle,
        'content': item.content,
        'viewPassword': item.viewPassword,
        'adminPassword': item.adminPassword
      },
      headers: {'Content-Type': 'application/json'}
    }).success(
      function (data) {
        if (data.code == 0) {
          $scope.apass = item.admin_password;
          $scope.wpass = item.viewPassword;
          $scope.$emit('seSiteTitle', item.title);
          ngNotify.set(data.message, 'success');
        } else {
          ngNotify.set(data.message, 'error');
        }
      }
    );
  };

  // 请求云端数据，有三种情况：
  // 1 云端没有任何记录，这个时候显示默认模板
  // 2 云端已经存在数据，且设置有阅读密码，这时候提示输入密码

  // 右上角留入口


});

// ============
function makepdf() {
  window.print();
  //post('http://pdf.ftqq.com',{'title':$('#drtitle').html(),'subtitle':$('#drsubtitle').html(),'content':$('#cvcontent').html(),'pdfkey':'jobdeersocool'});
  //后台接收生成pdf
  // $("#hform [name=title]").val($('#drtitle').html());
  // $("#hform [name=subtitle]").val($('#drsubtitle').html());
  // $("#hform [name=content]").val($('#cvcontent').html());
  // $("#hform [name=pdfkey]").val('jobdeersocool');
  // $("#hform").submit();
}

function post(path, params, method) {
  method = method || "post"; // Set method to post by default if not specified.

  var form = jQuery('<form/>', {
    'id': 'hform',
    'method': method,
    'action': path,
    'target': '_blank'
  });

  for (var key in params) {
    if (params.hasOwnProperty(key)) {

      var hiddenField = jQuery('<input/>', {
        'type': 'hidden',
        'name': key,
        'value': params[key]
      });

      form.appendChild(hiddenField);
    }
  }


  form.submit();
}


function pdf() {
  var doc = new jsPDF();
  var specialElementHandlers = {
    '.action-bar': function (element, renderer) {
      return true;
    }
  };

  doc.fromHTML($('#resume_body').get(0), 15, 15, {
    'width': 170,
    'elementHandlers': specialElementHandlers
  });

  doc.output("dataurlnewwindow");
}