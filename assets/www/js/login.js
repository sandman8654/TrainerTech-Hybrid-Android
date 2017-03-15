// SERVER
var apiUrl = 'http://trainertech.herokuapp.com/index.php/resources';
var apiImageConvertUrl = 'http://trainertech.herokuapp.com/index.php/convert_image_by_ajax/index';
var base_url = 'http://trainertech.herokuapp.com/';
var bucket_path = 'https://s3.amazonaws.com/trainertech/';

// LOCAL
// var apiUrl = 'http://localhost/trainfit/index.php/resources';
// var apiImageConvertUrl = 'http://localhost/trainfit/index.php/convert_image_by_ajax/index';
// var base_url= 'http://localhost/trainfit/';

var nxtlink = "";
var nxtset = "";

setInterval(function(){
  var closeSliding = $("#closeSliding").val();
  if(closeSliding === 'TRUE'){
    ons.slidingMenu.close();
  }
},1);

function showLoader(){
  $('#loaderImage').each(function(){
    $(this).remove();
  });
  
  $('body').append('<ons-icon id="loaderImage" icon="spinner" size="40px" spin="true" class="fa fa-spinner fa-fw fa-spin" style="position: fixed; top: 35%; left: 42%;"><img src="images/loader.png" width="40px" ></ons-icon>');
}

function hideLoader(){
  $('#loaderImage').each(function(){
    $(this).remove();
  });
}

function loggingIn(){          
	var email = $('#loginemail').val();
	var pass = $('#loginpass').val();          
	var flag = 1;

	if(email != '' && validateEmail(email)){
		$("#loginemail").css('border-bottom', '');
	}else{            
		$("#loginemail").css('border-bottom', '1px solid red');
		flag = 0;
	}

	if($("#loginpass").val() == ''){
		$("#loginpass").css('border-bottom', '1px solid red');
		flag = 0;
	}else{
		$("#loginpass").css('border-bottom', '');
	}

	if(flag == 1){
		$.ajax({
			method : 'POST',
			url : apiUrl,
			data:{email:email, password:pass, method:'trainee_login'},
			beforeSend:function(){        
				showLoader();
			},
			complete:function(){        
				hideLoader();
			},
			success:function(res){
				var result = JSON.parse(res);
				if(result.error){
					showAlert(result.error);
				}else{
		          var userid = result.success.result.id;
		          window.localStorage.setItem('userlogin', userid);
		          window.localStorage.setItem('trainer_id', result.success.result.trainer_id);
		          window.localStorage.setItem('user_fullname', result.success.result.fname);
		          var info = JSON.stringify(result.success.result);
		          //console.log(info);
		          window.localStorage.setItem('userinfo', info);
		          // console.log(info);
		          setTimeout(function(){
		            // $("ul.my-slider").append('<li class="rn-carousel-slide">TEST</li>');
		          },1000);
		          // $('#ontourpage').trigger('click');

		          // setTimeout(function(){
		          //   if(isOnline()){
		          //     $("#onsyncpage").trigger('click');
		          //   }
		          // },1000);

		          // $('#clicktoreturnorsync').trigger('click');

		          if(isOnline()){
		            // $("#onsyncpage").trigger('click');
		            
		            sync_dbHidden();
		            $('#clicktoreturnorsync').trigger('click');
		          }
		          else{
		            $('#clicktoreturnorsync').trigger('click');
		          }

		        }
			}
		});
	}
}

function validateEmail(email) { 
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function loggedout(){
	window.localStorage.setItem('userlogin', '');
	window.localStorage.setItem('user_info', '');
	window.localStorage.setItem('userinfo', '');
	window.localStorage.setItem('user_fullname', '');
	$('#backtologin').trigger('click');
}


function traineeSignup(){
	var fname = $('#sfname').val();
	var lname = $('#slname').val();
	var email = $('#semail').val();
	var pass = $('#spass').val();          
	var flag = 1;

	if(email != '' && validateEmail(email)){
		$("#semail").css('border-bottom', '');
	}else{            
		$("#semail").css('border-bottom', '1px solid red');
		flag = 0;
	}

	if(fname != ''){
		$("#sfname").css('border-bottom', '');
	}else{            
		$("#sfname").css('border-bottom', '1px solid red');
		flag = 0;
	}

	if(lname != ''){
		$("#slname").css('border-bottom', '');
	}else{            
		$("#slname").css('border-bottom', '1px solid red');
		flag = 0;
	}

	if($("#spass").val() == ''){
		$("#spass").css('border-bottom', '1px solid red');
		flag = 0;
	}else{
		$("#spass").css('border-bottom', '');
	}

	if(flag == 1){
		$.ajax({
			method : 'POST',
			url : apiUrl,
			data:{email:email, password:pass, method:'trainee_signup', fname:fname, lname:lname},
			beforeSend:function(){        
				showLoader();
			},
			complete:function(){        
				hideLoader();
			},
			success:function(res){
				var result = JSON.parse(res);
				if(result.error){
					showAlert(result.error);
				}else{
					var userid = result.success.result.id;
					window.localStorage.setItem('userlogin', userid);
					window.localStorage.setItem('user_fullname', result.success.result.fname);          
					var info = JSON.stringify(result.success.result);
					window.localStorage.setItem('userinfo', info);
					$('#ontourpage').trigger('click');
				}
			}
		});
	}
}

function setUserFullName(){  
	var name = window.localStorage.getItem('user_fullname');  
	$('.userfullname').html(name);
}

function starttimer(){
	 setTimeout(function(){
		$('.timer').timer();
	}, 1000);
}

function stoptimer(){
	 setTimeout(function(){
		$('.timer').timer('pause');
		var val = $(".timer").html();
		$('.timer').timer('remove');
		showAlert(val);
	}, 1000);
}

function setAccountInfo(){
	setUserFullName();
	var info = window.localStorage.getItem('userinfo');  
	var a = JSON.parse(info);
	
	$('#trainee_id').val(a.id);
	$('#ufname').val(a.fname);
	$('#ulname').val(a.lname);
	$('#uemail').val(a.email);
	$('#ucity').val(a.city);
	$('#uaddress').val(a.address);
	$('#goalweight').val(a.goalweight);
	
	var w = "";
	for (var i=100; i <= 400; i++) {
		if(i == a.currentweight){
			var sel = 'selected="selected"';
		}else{
			var sel="";
		}
		w +='<option value="'+i+'" '+sel+'>'+i+' lbs </option>';
	};

	$('#currentweight').html(w);

	var goal = "";
	for (var g=100; g <= 400; g++) {
		if(g == a.goalweight){
			var sel = 'selected="selected"';
		}else{
			var sel="";
		}
		goal +='<option value="'+g+'" '+sel+'>'+g+' lbs </option>';
	};

	$('#goalweight').html(goal);

	var he = "";

	for (var ft=4; ft <= 7; ft++) {
		if(ft == 7){
			he +='<option value="'+ft+'ft" >'+ft+'ft</option>';   
			break;
		}

		for (var inc=0; inc < 12; inc = parseFloat(inc+parseFloat(0.5))) {
			if(inc !=0){
				if((ft+'ft '+inc+'in') == a.height){
					var sel = 'selected="selected"';
				}else{
					var sel="";
				}
				he +='<option value="'+ft+'ft '+inc+'in" '+sel+' >'+ft+'ft '+inc+'in</option>';        
			}else{
				if((ft+'ft') == a.height){
					var sel = 'selected="selected"';
				}else{
					var sel="";
				}
				he +='<option value="'+ft+'ft" '+sel+' >'+ft+'ft</option>';
			}
		}
	}

	$('#height').html(he);   

	if(a.image !=""){
		db_userimage();
		// $('#proimage').attr('src',base_url+'assets/uploads/trainee/'+a.image);    
	}else{
		$('#proimage').attr('src','images/user.jpg');        
	}
}

function updateAccountInfo(){
	db_updateAccountInfo();
  return 0;
	var fname = $('#ufname').val();
	var lname = $('#ulname').val();
	var email = $('#uemail').val();
	var height = $('#height').val();
	var currentweight = $('#currentweight').val();
	var goalweight = $('#goalweight').val();
	
	var city = $('#ucity').val();
	var address = $('#uaddress').val();
	var trainee_id = $('#trainee_id').val();
	var img = $('#imgstr').val()

	var flag = 1;
	if(email != '' && validateEmail(email)){
			$("#uemail").css('border-bottom', '');
	}else{            
		$("#uemail").css('border-bottom', '1px solid red');
		flag = 0;
	}

	if(fname != ''){
			$("#ufname").css('border-bottom', '');
	}else{            
		$("#ufname").css('border-bottom', '1px solid red');
		flag = 0;
	}

	if(lname != ''){
			$("#ulname").css('border-bottom', '');
	}else{            
		$("#ulname").css('border-bottom', '1px solid red');
		flag = 0;
	}

	// if(city != ''){
	//   $("#ucity").css('border-bottom', '');
	// }else{
	//   flag = 0;
	//   $("#ucity").css('border-bottom', '1px solid red');
	// } 

	if(flag == 1){
		$.ajax({
			method : 'POST',
			url : apiUrl,
			data:{email:email,currentweight:currentweight, goalweight:goalweight, height:height, city:city,address:address, trainee_id:trainee_id, image:img, method:'update_trainee_profile', fname:fname, lname:lname},
			beforeSend:function(){        
				showLoader();
			},
			complete:function(){        
				hideLoader();
			},
			success:function(res){
				// showAlert(res);
				var result = JSON.parse(res);
				if(result.error){
					showAlert(result.error);
				}else{          
					//showAlert(result.success);
					updateSessioninfo();
					showAlert('Profile Updated.');
				}
			}
		});
	}
}

function updateSessioninfo(){
	db_updateSessioninfo();
  return 0;

	 var trid =  window.localStorage.getItem('userlogin');    
	 $.ajax({
			method : 'POST',
			url : apiUrl, 
			data: {trainee_id:trid, method:'get_trainee'},      
			success: function(res){
				var res = JSON.parse(res);
				if(res.error){
					showAlert(res.error);
				}else{
					
					var userid = res.result.id;
					
					window.localStorage.setItem('userlogin', userid);
					window.localStorage.setItem('user_fullname', res.result.fname);          
					var info = JSON.stringify(res.result);          
					window.localStorage.setItem('userinfo', info);
					return;          
				}
			}
		});
}


function setCalendarPage(){
  if(window.localStorage.getItem('currentMonth') == '1'){
  	db_setCalendarPage();
  }
  else{
    if(window.localStorage.getItem('currentMonth') == '0' && isOnline()){
      $("#clndr").css('padding-top','40px');
      var trid =  window.localStorage.getItem('userlogin');    
      var month = window.localStorage.getItem('monthh');
      var year = window.localStorage.getItem('yearr');

      $.ajax({
        method : 'POST',
        url : apiUrl, 
        data: {trainee_id:trid, method:'get_workout_dates' , 'year' : year , 'month' : month },
        beforeSend:function(){        
          showLoader();
        },
        complete:function(){        
          hideLoader();
        },
        success: function(res){
          var res = JSON.parse(res);
          if(res.error){
            this_is_not_current_month();
            open_calender();
          }else{            
            $("#clndr").css('padding-top','40px'); // 
            var av_dates = [];
            var new_divs = [];
            var week_f_date;
            $.each(res.results, function(index, value){ //
                var onclick = 'onclick="return getWorkout_byid_online('+value.workout_id+')"'
                
                var ndivclass = value.div_class.split(' ');
                ndivclass = ndivclass[0];               

                // $('#caltasks').append('<li style="display:none;" class="'+value.div_class+'" '+onclick+' ><p>'+value.date+'</p>'+value.name+'</li>');
                
                if($("li."+ndivclass).html() == undefined ){
                  $('#caltasks').append('<li style="display:none;" class="'+value.div_class+'"><p>'+value.date+'</p></li>');
                }

                var w_name = 'li.'+ndivclass+'<==>'+'<span '+onclick+'><br>'+value.name+'<br></span>'

                new_divs.push(w_name);

                av_dates.push(value.div_class);
                week_f_date = value.week_f_date;
            });
            var flaggg = true;

            $("table.cal td").each(function(){
              if($(this).html() != ''){
                var div = $(this).find('div');
                if(div.hasClass('cal-day')){

                  div.parent().parent().addClass('hideme');

                  var datee = div.data('cal');

                  if(datee == week_f_date){
                    div.parent().parent().addClass('donthideme');
                    flaggg = false;
                  }

                  datee = (datee.replace('/', '_')).replace('/', '_');
                  var flag = 0;                
                  $.each(av_dates, function(i,v){
                    var str = v;
                    var res0 = str.split(" ");
                     if(res0[1]){
                      if(datee == res0[0]){                   
                        flag = 1;
                      }
                     }else{
                      if(datee == v){
                        flag = 2;
                      }
                     }                  
                  });

                  if(flag == 2){
                    div.append('<div class="av_date"></div>');
                  }else{
                    if(flag == 1){
                      div.append('<div class="av_date_grey"></div>');
                    }
                  }
                }
              }
            });

            $.each(new_divs, function(i,v){
              // alert(v);
              var zzz = v.split('<==>');
              $(zzz[0]).append(zzz[1]);
            });

            if(flaggg){
              this_is_not_current_month();
            }

            show_single_row();

            open_calender();

            //caltasks
            return;          
          }
        }
      });
    }
    else{
      showAlert('Please connect to internet.');
      set_today_date();
    }
  }    
}


function setWorkout(){
  db_setWorkout();

  /*
  var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var d = new Date();          
  var dat = monthNames[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
  $('#workoutimage').attr('src', 'images/img1.jpg');    
  $('#wnamedate').html(dat);          
  $('#wnamedate').css('text-align','right');          
  $('#wdescription').html('No Scheduled Workout <br> For Today');
  $('#wdescription').css({'text-align':'center','font-size':'20px','margin-top':'40px'});
  $('#noworkoutbtn').show();
  */

  return 0;
  var trid =  window.localStorage.getItem('userlogin');
  $.ajax({
    method : 'POST',
    url : apiUrl, 
    data: {trainee_id:trid, method:'get_workout'},
    beforeSend:function(){        
      showLoader();
    },
    complete:function(){        
      hideLoader();
    },
    success: function(res){
      var res = JSON.parse(res);
      if(res.error){
        // showAlert(res.error);
        var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var d = new Date();          
        var dat = monthNames[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
        $('#workoutimage').attr('src', 'images/img1.jpg');    
        $('#wnamedate').html(dat);          
        $('#wnamedate').css('text-align','right');          
        $('#wdescription').html('No Scheduled Workout <br> For Today');
        $('#wdescription').css({'text-align':'center','font-size':'20px','margin-top':'40px'});
        $('#noworkoutbtn').show();
      }else{ 
      //showAlert(res.success.image);           
        // console.log(res.success); 
        $('#noworkoutbtn').hide();
        update_workoutstatus(res.success.workout_id);
        $('#workoutimage').attr('src', base_url+'assets/uploads/workout/'+res.success.image);    
        $('#timeval').html(res.success.time);
        $('#wnamedate').html(res.success.name+' <span>'+res.success.date+'</span>');
        $('#wdescription').html(res.success.description);
        var i = 1;
        var j = 1;
        var content = "";
        var ids="";
        var k = 1;
        $.each(res.success.exercises, function(key, row){            
          if(k !=1){
            ids += ',';
          }

          ids +=row.exercise_id;
          k++;

        });
        //console.log(ids);
        content +='<ons-row class="row ons-row-inner" >';              
        var flag =0;
        $.each(res.success.exercises, function(index, value){

            if(flag==0 && value.status == 0){
              $('#workoutbtn').attr('onclick','return exerciseDetails('+value.exercise_id+', \''+ids+'\')')
              flag=1;
            }

            var clos = '';
            if(value.status == 1){
              var clos = 'closed';
            }

            //var content0 = "";
            content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return exerciseDetails('+value.exercise_id+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+value.exercise+'</a></ons-col>';
            //content +='<ons-col class="col ons-col-inner"><a href="#" ng-click="ons.slidingMenu.setAbovePage("page5.html")"><span>'+parseInt(j+1)+'</span>'+value.exercise+'</a></ons-col>';
            if(i%2 == 0){
              content +='</ons-row>';
              content +='<ons-row class="row ons-row-inner" >';
            }



           // console.log(content);
            //$('#appendexercises').append(content);

            //content += content;
            i++;
            j++;
            //console.log(value);              
            //$.each(value.sets, function(index1, value1){
              //console.log(value1);
              //$('#caltasks').append('<li><p>'+value.date+'</p>'+value.name+'</li>');
            //});

        });

        content +='</ons-row>'; 

        $('#appendexercises').append(content); 
        $('#workoutbtn').show();
        //caltasks
        return;          
      }
    }
  });
  
}

function getWorkout_byid_online(id){
  if(window.localStorage.getItem('currentMonth') == '0' && isOnline()){
    $('#pnworkoutpage').trigger('click');
    var trid =  window.localStorage.getItem('userlogin');    
    setTimeout(function(){
      $.ajax({
      method : 'POST',
      url : apiUrl, 
      data: {trainee_id:trid,id:id, method:'getWorkout_byid'},
      beforeSend:function(){        
        showLoader();
      },
      complete:function(){        
        hideLoader();
      },
      success: function(res){
        var res = JSON.parse(res);
        if(res.error){
          showAlert(res.error);
        }else{ 
          $('#workoutimage').attr('src', bucket_path+res.success.image);    
          
          $('#workoutimage')
            .load(function(){
              // alert('Image is loaded');
            })
            .error(function(){
              // alert('Image is not loaded');
              $('#workoutimage').remove();
              $('#wdescription').css('padding-top', '50px');
            });

          $('#timeval').html(res.success.time);
          $('#wnamedate').html(res.success.name+' <span>'+res.success.date+'</span>');
          $('#wdescription').html(res.success.description);
          var i = 1;
          var j = 1;
          var content = "";
          var ids="";
          var k = 1;
          $.each(res.success.exercises, function(key, row){            
            if(k !=1){
              ids += ',';
            }

            ids +=row.exercise_id;
            k++;

          });
          content +='<ons-row class="row ons-row-inner" >';              
          var flag =0;
          $.each(res.success.exercises, function(index, value){
            if(flag==0){
              $('#workoutbtn').attr('onclick','return exerciseDetailsOnline('+value.exercise_id+', \''+ids+'\')')
              $('#workoutbtn').html('View Workout');
              flag=1;
            }
            
            var clos = '';
            if(value.status == 1){
              var clos = 'closed';
            }

            content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return exerciseDetailsOnline('+value.exercise_id+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+value.exercise+'</a></ons-col>';
            if(i%2 == 0){
              content +='</ons-row>';
              content +='<ons-row class="row ons-row-inner" >';
            }
            i++;
            j++;
          });
          content +='</ons-row>'; 
          $('#appendexercises').append(content); 
          $('#workoutbtn').show();
          return;          
        }
      }
    });
   },1000);
  }
  else{
    showAlert('Please connect to internet.');
    set_today_date();
  }
}

function getNewCircuitWorkoutById(id){
  db_getNewCircuitWorkoutById(id);
}

function getWorkout_byid(id){
  db_getWorkout_byid(id);
  return 0;
  $('#pnworkoutpage').trigger('click');
  var trid =  window.localStorage.getItem('userlogin');    
   setTimeout(function(){
      $.ajax({
      method : 'POST',
      url : apiUrl, 
      data: {trainee_id:trid,id:id, method:'getWorkout_byid'},
      beforeSend:function(){        
        showLoader();
      },
      complete:function(){        
        hideLoader();
      },
      success: function(res){
        var res = JSON.parse(res);
        if(res.error){
          showAlert(res.error);
        }else{ 
        //alert(res.success.image);           
          //console.log(res.success.exercises); 
          update_workoutstatus(res.success.workout_id);
          $('#workoutimage').attr('src', base_url+'assets/uploads/workout/'+res.success.image);    
          $('#timeval').html(res.success.time);
          $('#wnamedate').html(res.success.name+' <span>'+res.success.date+'</span>');
          $('#wdescription').html(res.success.description);
          var i = 1;
          var j = 1;
          var content = "";
          var ids="";
          var k = 1;
          $.each(res.success.exercises, function(key, row){            
            if(k !=1){
              ids += ',';
            }

            ids +=row.exercise_id;
            k++;

          });
          //console.log(ids);
          content +='<ons-row class="row ons-row-inner" >';              
          var flag =0;
          $.each(res.success.exercises, function(index, value){

              if(flag==0 && value.status == 0){
                $('#workoutbtn').attr('onclick','return exerciseDetails('+value.exercise_id+', \''+ids+'\')')
                flag=1;
              }

              var clos = '';
              if(value.status == 1){
                var clos = 'closed';
              }

              //var content0 = "";
              content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return exerciseDetails('+value.exercise_id+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+value.exercise+'</a></ons-col>';
              //content +='<ons-col class="col ons-col-inner"><a href="#" ng-click="ons.slidingMenu.setAbovePage("page5.html")"><span>'+parseInt(j+1)+'</span>'+value.exercise+'</a></ons-col>';
              if(i%2 == 0){
                content +='</ons-row>';
                content +='<ons-row class="row ons-row-inner" >';
              }



             // console.log(content);
              //$('#appendexercises').append(content);

              //content += content;
              i++;
              j++;
              //console.log(value);              
              //$.each(value.sets, function(index1, value1){
                //console.log(value1);
                //$('#caltasks').append('<li><p>'+value.date+'</p>'+value.name+'</li>');
              //});

          });

          content +='</ons-row>'; 

          $('#appendexercises').append(content); 
          $('#workoutbtn').show();
          //caltasks
          return;          
        }
      }
    });

   },1000);
}

function oldExerciseDetails(id, ids){
  $('#onoldexersicedetail').trigger('click');
  db_oldEexerciseDetails(id, ids);
}

function circuitOldExerciseDetails(id, ids){
  $('#onoldexersicedetail').trigger('click');
  db_circuitOldEexerciseDetails(id, ids);
}

function exerciseDetailsOnline(id, ids){
  if(window.localStorage.getItem('currentMonth') == '0' && isOnline()){
    $('#onoldexersicedetail').trigger('click');
    setTimeout(function(){
      ids = ids.split(',');    
      for (var i = 0; i <= ids.length; i++) {                          
        if(id == ids[i]){
          if(ids[parseInt(i+1)]){        
            var nextid  = ids[parseInt(i+1)];
            var nxtlink = "exerciseDetailsOnline("+nextid+",'"+ids+"')";
          }else{
            nxtlink = false;
          }

          if(ids[parseInt(i-1)]){        
            var backid  = ids[parseInt(i-1)];
            var backlink = "exerciseDetailsOnline("+backid+",'"+ids+"')";
          }else{
            var backlink = false;
          }

          break;

        }
      };

      var trid =  window.localStorage.getItem('userlogin');    
     $.ajax({
        method : 'POST',
        url : apiUrl, 
        data: {
          'id' : id,
          'trainee_id' : trid,
          'method' : 'get_exercisedetails'
        },
        beforeSend:function(){        
          showLoader();
        },
        complete:function(){        
          hideLoader();
        },
        success: function(res){
          var res = JSON.parse(res);
          if(res.error){
            showAlert(res.error);
          }else{                      
            $('#excerciseimage').attr('src', bucket_path+res.success.image);    
            $('#excerciseimage')
              .load(function(){
                // alert('Image is loaded');
              })
              .error(function(){
                // alert('Image is not loaded');
                $('#excerciseimage').remove();
                $('#exercisedesc').css('padding-top', '50px');
              });

            if(res.success.notes_show == '1')
              $("#exercise_notes").html( 'Notes to Trainer : <br> ' + res.success.notes);
            else
              $("#exercise_notes").html( 'Notes to Trainer : ' );
              


            $('#exercisename').html(res.success.exercise);
            $('#exercisedesc').html(res.success.description);
            
            var rest_time = res.success.resttime;
            if(rest_time == "" || rest_time == "0"){
              $('#resttime').val('1');
            }else{
              $('#resttime').val(rest_time);
            }
            
            $('.returnhome').attr('onclick',"return oldreturntohome("+res.success.workout_id+")");          
            var i = 1;
            var j = 1;
            var content = "";          
            
            content += '<ons-row class="lt row ons-row-inner">';
            content += '<ons-col class="col ons-col-inner">Set</ons-col>';
            content += '<ons-col class="col ons-col-inner">Weight</ons-col>';            
            content += '<ons-col class="col ons-col-inner">Reps</ons-col>';            
            content += '</ons-row>';
            var len = res.success.set.length;
            
            $.each(res.success.set, function(index, value){            
              
              // content += '<ons-row class="row ons-row-inner">';
              // content += '<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
              // content += '<ons-col class="col ons-col-inner"><i>'+value.value+'</i></ons-col>';            
              // content += '<ons-col class="col ons-col-inner"><i>'+value.reps+'</i></ons-col>';            
              // content += '</ons-row>';

              content += '<ons-row class="row ons-row-inner">';
              content += '<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
              
              if(res.success.notes_show == '1'){
                content += '<ons-col class="col ons-col-inner">';
                
                if( value.resultweight < value.value )
                  content += '<i class="red">'+value.resultweight+'</i> lbs'
                else if( value.resultweight > value.value )
                  content += '<i class="green">'+value.resultweight+'</i> lbs'
                else
                  content += '<i>'+value.resultweight+'</i> lbs'
                
                content += '</ons-col>';

                content += '<ons-col class="col ons-col-inner">';
                
                if( value.resultreps < value.reps )
                  content += '<i class="red">'+value.resultreps+'</i>'
                else if( value.resultreps > value.reps )
                  content += '<i class="green">'+value.resultreps+'</i>'
                else
                  content += '<i>'+value.resultreps+'</i>'
                
                content += '</ons-col>';
              }
              else{
                content += '<ons-col class="col ons-col-inner">';
                
                content += '<i>'+value.value+'</i> lbs'
                
                content += '</ons-col>';

                content += '<ons-col class="col ons-col-inner">';
                
                content += '<i>'+value.reps+'</i>'
                
                content += '</ons-col>';
              }

              content += '</ons-row>';
            


              j++;
            });

            if(nxtlink != false){
              $("#nxtt_btn").attr('onclick', nxtlink);
            }
            else{
              $("#nxtt_btn").html('Done');
              $('#nxtt_btn').attr('onclick',"return oldreturntohome("+res.success.workout_id+")");   
            }
            
            if(backlink != false){
              $("#backk_btn").attr('onclick', backlink);
            }
            else{
              $("#backk_btn").css('background', '#cccccc');
            }

            $('#exercise_set').html(content);

            // alert(content);
          
          }
        }
      });

    }, 1000);
  }
  else{
    showAlert('Please connect to internet.');
    set_today_date();
  }
}

function circuit_or_exerciseDetails(id, ids){ 
  $('#onexersicedetail').trigger('click');
  db_circuitOrExerciseDetails(id, ids);
  return 0;
}

function circuitExerciseDetails(id, ids){ 
  $('#onexersicedetail').trigger('click');
  db_circuitExerciseDetails(id, ids);
  return 0;
}

function oldCircuitExerciseDetails(id, ids){ 
  $('#onexersicedetail').trigger('click');
  db_circuitOldEexerciseDetails(id, ids);
  return 0;
}

function oldCircuitOrExerciseDetails(id, ids){ 
  $('#onexersicedetail').trigger('click');
  db_oldCircuitOrExerciseDetails(id, ids);
  return 0;
}

function circuitExerciseDetailsFuture(id, ids){ 
  $('#onexersicedetail').trigger('click');
  db_circuitExerciseDetailsFuture(id, ids);
  return 0;
}

function circuitOrExerciseDetailsFuture(id, ids){ 
  $('#onexersicedetail').trigger('click');
  db_circuitOrExerciseDetailsFuture(id, ids);
  return 0;
}

function exerciseDetails(id, ids){    
  //var updateid;
  //var updateweight;
  //var updatereps;
  $('#onexersicedetail').trigger('click');

  // var arr = [];
  // $('.res_set').each(function(){
  //     var updateid   = $(this).attr('id');
  //     var updateweight   = $(this).find('.w_val').html();
  //     var updatereps = $(this).find('.r_val').html();            
  //     arr.push({
  //       id:updateid,
  //       weight:updateweight,
  //       reps:updatereps,
  //     });
  // });

  // //console.log(arr);

  // $.ajax({
  //    method : 'POST',
  //     url : apiUrl, 
  //     data: {updatearr:arr, method:'update_exercise_set'},      
  // })
  
  db_exerciseDetails(id, ids);

return 0;
  

 setTimeout(function(){    
    setUserFullName();
    
   

    ids = ids.split(',');    
    for (var i = 0; i <= ids.length; i++) {                          
      if(id == ids[i]){
        if(ids[parseInt(i+1)]){        
          var nextid  = ids[parseInt(i+1)];
          // nxtlink = "exerciseDetails("+nextid+",'"+ids+"')";
          nxtlink = "Nextexercise("+id+","+nextid+",'"+ids+"')";
          
          //$('#nxtexercise').attr('onclick',"exerciseDetails("+nextid+",'"+ids+"')");
          //$('#nxtexercise').html('Next Exercise <img src="images/arr-r.png">');
          
          //$('#nxtexercise').css('color','#fff');
          
          //console.log(nextid);
          break;
        }else{
          nxtlink="show_cooldownmodal("+id+");";
          //$('#nxtexercise').attr('disabled','disabled');
          $('#nxtexercise').html('Complete <img src="images/arr-r.png" style="opacity:0">');
        }
      }
    }; 
    

  var trid =  window.localStorage.getItem('userlogin');    
   $.ajax({
      method : 'POST',
      url : apiUrl, 
      data: {id:id, method:'get_exercisedetails'},
      beforeSend:function(){        
        showLoader();
      },
      complete:function(){        
        hideLoader();
      },
      success: function(res){
        var res = JSON.parse(res);
        if(res.error){
          showAlert(res.error);
        }else{                      
          // console.log(res.success);          
          //return;
          $('#excerciseimage').attr('src', base_url+'assets/uploads/exercise/'+res.success.image);    
          $('#exercisename').html(res.success.exercise);
          $('#exercisedesc').html(res.success.description);
          var rest_time = res.success.resttime;
          // alert(rest_time);
          if(rest_time == "" || rest_time == "0"){
            // alert('0 or null');
            $('#resttime').val('1');
          }else{
            // alert('time');
            $('#resttime').val(rest_time);
          }
          $('.returnhome').attr('onclick',"return returntohome("+res.success.workout_id+")");          
          var i = 1;
          var j = 1;
          var content = "";          
          //alert(res.success.set.length);
            content += '<ons-row class="lt row ons-row-inner">';
            content +='<ons-col class="col ons-col-inner">Set</ons-col>';
            content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
            content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
            content +='</ons-row>';
          var len = res.success.set.length;
          $.each(res.success.set, function(index, value){            
            // console.log(value);

            content += '<ons-row class="row ons-row-inner">';
            content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
            content +='<ons-col class="col ons-col-inner"><i>'+value.value+'</i></ons-col>';            
            content +='<ons-col class="col ons-col-inner"><i>'+value.reps+'</i></ons-col>';            
            content +='</ons-row>';
              //$.each(value.sets, function(index1, value1){
                //console.log(value1);
                //$('#caltasks').append('<li><p>'+value.date+'</p>'+value.name+'</li>');
              //});
              j++;

          });

          var h = 1;

            rcontent = "";           
            rcontent += '<div class="success"><p>Success!</p><h3>You finished this round!</h3></div><div class="results left"><h4>Results</h4></div>';           

          $.each(res.success.set, function(index, value){                        

            rcontent += '<div class="bench pad_lt"><ons-row class="row ons-row-inner" ><ons-col class="col ons-col-inner">Set '+h+'</ons-col><ons-col class="col ons-col-inner">Weight</ons-col><ons-col class="col ons-col-inner">Reps</ons-col></ons-row></div>';
            rcontent +='<div class="results left"><ons-row class="row ons-row-inner res_set" id="'+value.id+'" >';
            rcontent +='<ons-col class="col ons-col-inner"></ons-col>';
            rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
            rcontent+='<select class="counterselect wselect">';
            for (var i = 50; i <= 400; i=i+5) {              
              rcontent+='<option value="'+i+'">'+i+'</option>';
            };
            rcontent+="</select></div></ons-col>";

            rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
            rcontent+='<select class="counterselect rselect">';
            for (var j = 1; j <= 10; j++) {
              rcontent+='<option value="'+j+'">'+j+'</option>';
            };
            rcontent+="</select></div></ons-col>";
            rcontent+='</ons-row></div>';

            // rcontent+='<span class="w_val">'+value.value+'</span><a href="#" class="right_weight"><img src="images/ar.png"></a></div></ons-col><ons-col class="col ons-col-inner"><div class="counter"><a href="#" class="left_reps"><img src="images/al.png"></a><span class="r_val">'+value.reps+'</span><a href="#" class="right_reps"><img src="images/ar.png"></a></div></ons-col></ons-row></div>'

            // rcontent += '<ons-row class="row ons-row-inner res_set" id="'+value.id+'">';
            // rcontent +='<ons-col class="col ons-col-inner rset"><i>'+h+'</i> of <i>'+len+'</i></ons-col>';
            // rcontent +='<ons-col class="col ons-col-inner"><div class="counter"><a href="#" class="left_weight"><img src="images/count-l.png"></a><span class="w_val">'+value.value+'</span><a href="#" class="right_weight"><img src="images/count-r.png"></a></div></ons-col>';
            // rcontent +='<ons-col class="col ons-col-inner"><div class="counter"><a href="#" class="left_reps"><img src="images/count-l.png"></a><span class="r_val">'+value.reps+'</span><a href="#" class="right_reps"><img src="images/count-r.png"></a></div></ons-col>';
            // rcontent +='</ons-row>';




              //$.each(value.sets, function(index1, value1){
                //console.log(value1);
                //$('#caltasks').append('<li><p>'+value.date+'</p>'+value.name+'</li>');
              //});
              h++;

          });
          
          rcontent +='<a href="#" class="full blue" onclick="return '+nxtlink+'" style="margin:10px 18px;">Next</a>';


          var s_ids="";
          var o = 1;
          var s_id = ""
          $.each(res.success.set, function(key, row){ 
            if(o == 1){
              s_id = row.id;
            }

            if(o !=1){
              s_ids += ',';
            }

            s_ids +=row.id;
            o++;

          });

          // console.log(s_ids);


          var s = 1;

            setcontent = "";           
            setcontent += '<div class="success"><p>Success!</p><h3>You finished this round!</h3></div><div class="results left"><h4>Results</h4></div>';           

          $.each(res.success.set, function(index, value){                        

            if(s==1){
              $('.setone').attr('onclick','return showsetmodalbox('+value.id+', \''+s_ids+'\',"YES")');
            }

            setcontent += '<div class="bench pad_lt hideset set'+value.id+'"><ons-row class="row ons-row-inner" ><ons-col class="col ons-col-inner">Set '+s+'</ons-col><ons-col class="col ons-col-inner">Weight</ons-col><ons-col class="col ons-col-inner">Reps</ons-col></ons-row></div>';
            setcontent +='<div class="results left hideset set'+value.id+'"><ons-row class="row ons-row-inner res_set0" id="set'+value.id+'" >';
            setcontent +='<ons-col class="col ons-col-inner"></ons-col>';
            setcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
            setcontent+='<select class="counterselect wselect wsetval'+value.id+'">';
            for (var i = 50; i <= 400; i=i+5) {              
              setcontent+='<option value="'+i+'">'+i+'</option>';
            };
            setcontent+="</select></div></ons-col>";

            setcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
            setcontent+='<select class="counterselect rselect rsetval'+value.id+'">';
            for (var j = 1; j <= 10; j++) {
              setcontent+='<option value="'+j+'">'+j+'</option>';
            };
            setcontent+="</select></div></ons-col>";
            setcontent+='</ons-row></div>';           
              s++;

          });
          
          setcontent +='<a href="#" class="full blue" id="nextset" onclick="return SavesetNcont('+s_id+', \''+s_ids+'\')" style="margin:10px 18px;">Next</a>';



            $('#exercise_set').html(content); 
            $('#results').html(rcontent); 
            $('#setsresults').html(setcontent); 
          
          return;          
        }
      }
    });   

 }, 1000);
}


function SavesetNcont(sid,s_ids){

  var istimer = $('#istime').val();
  if(istimer == 1){
    hidesetmodalbox();
    showsetendtime(sid,s_ids);

  }

    // var tim = $('.timer').html();
    // var n = tim.indexOf(":");
    // if(parseInt(n) == -1){
    //  tim = "00:"+tim; 
    // }

    // $.ajax({
      // method : 'POST',
      // url : apiUrl, 
      // data: {timetake:tim,eid:id,method:'update_timetaken'},
    // });
    
    if(istimer !=1){
      showsetmodalbox(sid,s_ids);
    }


  
}

function stopcountdown(){
  $('.timer0').removeClass('is-countdown');
}

  
function showsetendtime(sid,s_ids){
  db_showsetendtime(sid,s_ids);
return 0;    
  stopcountdown();
  var min = $('#resttime').val();
  if(min !=""){
    min = parseInt(min);
    // min = 1;
    var currdate = new Date();

    // alert('0')
    var at = currdate.setMinutes(currdate.getMinutes() + min);      
    console.log(new Date(at));
    $('.timer0').countdown({until: new Date(at),format: 'MS',layout: '{mnn}{sep}{snn}', onExpiry:stopcountdown});
  }

  // $('.countdown-period').hide()
  // $('.countdown-show2:nth-child(0)').find('.countdown-period').html(':');
  // $('.countdown-show2:nth-child(0)').find('.countdown-period').show();

  var nextid="";
  var nsetlink ="";
  s_ids = s_ids.split(',');    
    for (var i = 0; i <= s_ids.length; i++) {                          
      if(sid == s_ids[i]){
        if(s_ids[parseInt(i+1)]){        
          var nextid  = s_ids[parseInt(i+1)];          
          nxtset = "showsetendtime("+nextid+",'"+s_ids+"','YES')";
          $('#nextset').attr('onclick',nxtset);
            nsetlink = 'showsetmodalbox("'+nextid+'","'+s_ids+'","YES")';
          //console.log(nextid);
          break;
        }else{
          nsetlink = 'showRmodalbox()';   
          nxtset = "showsetendtime("+s_ids[0]+",'"+s_ids+"','YES')";       
          $('#nextset').attr('onclick',nxtset) ;
          break;         
        }
      }
    };

    // console.log(sid+'--'+nextid);


  $('#setmodalbox').hide();
  $('#setendtimebox').show();
  $('#tabbarbtm').hide();
  $('#hideonmodal').hide();
  $('.navigation-bar').css('z-index',0);
  $('#nextsetGO').attr('onclick',nsetlink);
  $('#nextsetskip').attr('onclick',nsetlink);
  $('.block').css('z-index',9999);  
  // $('.timer').timer('pause');    
  // var tim = $('.timer').html();
  // var n = tim.indexOf(":");
  // if(parseInt(n) != -1){
  //   $('#setspendtime').html(tim);
  // }else{
  //   $('#setspendtime').html('00:'+tim);
  // }

  //  var tim = $('.timer').html();
  //   var n = tim.indexOf(":");
  //   if(parseInt(n) == -1){
  //    tim = "00:"+tim; 
  //   }

    var we = $('.set'+sid).find('.wsetval'+sid).val();
    var re = $('.set'+sid).find('.rsetval'+sid).val();
    $('#'+sid).find('.wselect').val(we);
    $('#'+sid).find('.rselect').val(re);

    $.ajax({
      method : 'POST',
      url : apiUrl, 
      data: {timetake:0,setid:sid,weight:we,reps:re,method:'update_setntime'},      
    });

  setTimeout(function(){
    // $('#istime').val(0);
  },1000);

  
  // $('.timer').timer('remove');
}

function hidesetendtimebox(){
  stopcountdown();
  $('#hideonmodal').show();
  $('#modalbox').hide();  
  $('#setendtimebox').hide();  
  $('#Rmodalbox').hide();
  $('#tabbarbtm').show();
  $('.navigation-bar').css('z-index',1000);
  $('#istime').val('0');
  $('.timer').timer('remove');
}

function OldNextexercise(id, nextid, ids){
  db_OldNextexercise(id, nextid, ids);
  return 0;
}

function Nextexercise(id, nextid, ids){
  db_Nextexercise(id, nextid, ids);
  return 0;
  stopcountdown();
  var istimer = $('#istime').val();
  if(istimer == 1){
    hideRbox();    
    showendtime(nextid,ids);

    var tim = $('.timer').html();
    var n = tim.indexOf(":");
    if(parseInt(n) == -1){
     tim = "00:"+tim; 
    }

    $.ajax({
      method : 'POST',
      url : apiUrl, 
      data: {timetake:tim,eid:id,method:'update_timetaken'},
    });

  }

  setTimeout(function(){
    var arr = [];
  $('.res_set').each(function(){
      var updateid   = $(this).attr('id');
      var updateweight   = $(this).find('.wselect').val();
      var updatereps = $(this).find('.rselect').val();            
      arr.push({
        id:updateid,
        weight:updateweight,
        reps:updatereps,
      });
  });  

  $.ajax({
     method : 'POST',
      url : apiUrl, 
      data: {updatearr:arr, method:'update_exercise_set'},            
  })

  var note = $('#exercise_notes').val();  
     $.ajax({
      method:'POST',
      url : apiUrl, 
      data: {id:id,note:note, method:'update_exercise'},    
    });
    // exerciseDetails(nextid,ids);   

    if(istimer != 1){
      exerciseDetails(nextid,ids);      
    } 

  }, 1000)
}

function hidebox(){
  $('#modalbox').hide();
  $('#tabbarbtm').show();
  $('#hideonmodal').show();
  $('.navigation-bar').css('z-index',1000);
}

function showmodalbox(){    
  $('#modalbox').show();
  $('#tabbarbtm').hide();
  $('#hideonmodal').hide();
  $('.navigation-bar').css('z-index',0);
  $('.block').css('z-index',9999);
}

function showendtime(nextid,ids){    
  $('#endtimebox').show();
  $('#tabbarbtm').hide();
  $('#hideonmodal').hide();
  $('.navigation-bar').css('z-index',0);
  $('.block').css('z-index',9999);
  $('#endGO').attr('onclick', 'exerciseDetails("'+nextid+'","'+ids+'")');
  $('.timer').timer('pause');    
  var tim = $('.timer').html();
  var n = tim.indexOf(":");
  if(parseInt(n) != -1){
    $('#spendtime').html(tim);
  }else{
    $('#spendtime').html('00:'+tim);
  }

  setTimeout(function(){
    $('#istime').val(0);
  },1000);

  
  $('.timer').timer('remove');
}


function hideRbox(){
  $('#hideonmodal').show();
$('#modalbox').hide();  
  $('#Rmodalbox').hide();
  $('#tabbarbtm').show();
  $('.navigation-bar').css('z-index',1000);
  $('#istime').val('0');
  $('.timer').timer('remove');
}

function showRmodalbox(val){ 
  if(val == 'YES'){
    starttimer();
    $('#istime').val('1');
  }else{
    $('#istime').val('0');
    $('.timer').timer('remove');
  }
  
  $('#setmodalbox').hide();
  $('#setendtimebox').hide();
  $('#hideonmodal').hide();
  $('#modalbox').hide();   
  $('#Rmodalbox').show();
  $('#tabbarbtm').hide();
  $('.navigation-bar').css('z-index',0);
  $('.block').css('z-index',9999);

}

function hidesetmodalbox(){
  $('#hideonmodal').show();
  $('#modalbox').hide();  
  $('#Rmodalbox').hide();
  $('#setmodalbox').hide();
  $('#tabbarbtm').show();
  $('.navigation-bar').css('z-index',1000);
  // $('#istime').val('0');
  // $('.timer').timer('remove');
}

function showsetmodalbox(id,s_ids,val){
  // console.log(id);
  // console.log(s_ids);
  if(val == 'YES'){
    starttimer();
    $('#istime').val('1');
  }else{
    $('#istime').val('0');
    $('.timer').timer('remove');
  }

  $('.hideset').hide();
  $('.set'+id).show();

  $('#setendtimebox').hide();
  $('#hideonmodal').hide();
  $('#modalbox').hide();   
  $('#Rmodalbox').hide();
  $('#setmodalbox').show();
  $('#tabbarbtm').hide();
  $('.navigation-bar').css('z-index',0);
  $('.block').css('z-index',9999);

}


function hide_cooldownmodal(){
  $('#hideonmodal').show();
  $('#cooldownmodal').hide();  
  $('#modalbox').hide();  
  $('#Rmodalbox').hide();
  $('#tabbarbtm').show();
  $('.navigation-bar').css('z-index',1000);
}

function show_cooldownmodal(id){
  db_show_cooldownmodal(id);
  return 0;
  stopcountdown();
 var min = $('#resttime').val();
  // min = 1;
  if(min !=""){
  min = parseInt(min);
  var currdate = new Date();
  var at = currdate.setMinutes(currdate.getMinutes() + min);      
  $('.timer0').countdown({until: new Date(at),format: 'MS',layout: '{mnn}{sep}{snn}', onExpiry:stopcountdown});
  }

  // var istimer = $('#istime').val();
  // if(istimer == '1'){
  //   var tim = $('.timer').html();
  //   var n = tim.indexOf(":");
  //   if(parseInt(n) != -1){
  //     $('#lasttime').html(tim);
  //   }else{
  //     $('#lasttime').html('00:'+tim);
  //     tim = "00:"+tim; 
  //   }

  //   $.ajax({
  //     method : 'POST',
  //     url : apiUrl, 
  //     data: {timetake:0,eid:id,method:'update_timetaken'},
  //   });


  //   $('#istime').val('0');
  //   $('.timer').timer('pause');
  //   $('.timer').timer('remove');

  // }else{
  //   $('#lasttime').html('00:00');
  // }



  setTimeout(function(){
    var arr = [];
  $('.res_set').each(function(){
      var updateid   = $(this).attr('id');
      var updateweight   = $(this).find('.wselect').val();
      var updatereps = $(this).find('.rselect').val();
      arr.push({
        id:updateid,
        weight:updateweight,
        reps:updatereps,
      });
  });  

  $.ajax({
     method : 'POST',
      url : apiUrl, 
      data: {updatearr:arr, method:'update_exercise_set'},            
  })

  var note = $('#exercise_notes').val();  
     $.ajax({
      method:'POST',
      url : apiUrl, 
      data: {id:id,note:note, method:'update_exercise'},    
    });
   // exerciseDetails(nextid,ids);   

  $('#hideonmodal').hide();
  $('#modalbox').hide();   
  $('#Rmodalbox').hide();
  $('#cooldownmodal').show();
  $('#tabbarbtm').hide();
  $('.navigation-bar').css('z-index',0);
  $('.block').css('z-index',9999); 

  }, 1000)

  
}

function hide_finishedmodal(){
  $('#hideonmodal').show();
  $('#finishedmodal').hide();  
  $('#cooldownmodal').hide();  
  $('#modalbox').hide();  
  $('#Rmodalbox').hide();
  $('#tabbarbtm').show();
  $('.navigation-bar').css('z-index',1000);  
}

function show_finishedmodal(){ 
  $("#exercise_notes").remove();

  $('#hideonmodal').hide();
  $('#modalbox').hide();   
  $('#Rmodalbox').hide();
  $('#cooldownmodal').hide();
  
  showLoader();
  setTimeout(function(){
    hideLoader();
    $('#finishedmodal').show();
  }, 1000);    
  
  $('#tabbarbtm').hide();
  $('.navigation-bar').css('z-index',0);
  $('.block').css('z-index',9999);  
}


function forgetpassword(){          
  var email = $('#forgetemail').val();  
  var flag = 1;

  if(email != '' && validateEmail(email)){
      $("#forgetemail").css('border-bottom', '');
  }else{            
    $("#forgetemail").css('border-bottom', '1px solid red');
    flag = 0;
  }
  
  if(flag == 1){
    $.ajax({
      method : 'POST',
      url : apiUrl,
      data:{email:email, method:'forgetpassword'},
      beforeSend:function(){        
        showLoader();
      },
      complete:function(){        
        hideLoader();
      },
      success:function(res){
        var result = JSON.parse(res);
        if(result.error){
          showAlert(result.error);
        }else{
         showAlert(result.success);
        }
      }
    });
  }

}

function open_calender(){
  // alert(1); // clndr asd
  $("div.cal").animate({ 'height' : '400px' } , 10);
  $("#toggle_cal").attr('onclick', 'close_calender();');
  $('#toggle_cal').find('img').attr('src','images/ar-up.png');
  show_all_row();
}

function close_calender(){
  $("div.cal").animate({ 'height' : '130px' } , 10);
  $("#toggle_cal").attr('onclick', 'open_calender();');
  $('#toggle_cal').find('img').attr('src','images/arr-dawn.png');
  show_single_row();
}


function show_single_row(){
  $(".hideme").hide();
  $(".donthideme").show();
}

function show_all_row(){
  $(".hideme").show();
  $(".donthideme").show();
}



$(document).on('click', '.cal-day', function(){
  $(".cal-day").each(function(){
    if($(this).hasClass('cal-highlight')){
      $(this).removeClass('cal-highlight');
    }
  });
  $(this).addClass('cal-highlight');
  var selected_date = $(this).data('cal');
  var flag = 0;
  var clas = (selected_date.replace('/', '_')).replace('/', '_');
  $("ul#caltasks li").each(function(){
    $(this).hide();
    if($(this).hasClass(clas)){
      $(this).show();
      flag = 1;
    }
  });
  if(flag == 0){
    $("ul#caltasks li").each(function(){
      // $(this).show();
      $(this).hide();
    });
    showAlert('No workout for this date.');
  }
});


$(document).ready(function(){   
    
    $(document).on('click','.left_reps', function(){
        var par = $(this).parent().find('.r_val');
        var cur = par.html();
        if(checknumber(cur)){
          var newval = parseInt(parseInt(cur)-1);
          if(newval >= 0){
            par.html(newval);
          }
        }
    });
    
    $(document).on('click','.right_reps', function(){
        var par = $(this).parent().find('.r_val');
        var cur = par.html();
        if(checknumber(cur)){
          var newval = parseInt(parseInt(cur)+1);
          if(newval >= 0){
            par.html(newval);
          }
        }
    });
    
    $(document).on('click','.left_weight', function(){
      var par = $(this).parent().find('.w_val');
      var cur = par.html();
      if(checknumber(cur)){
        var newval = parseInt(parseInt(cur)-1);
        if(newval >= 0){
          par.html(newval);
        }
      }

    });

    
    $(document).on('click','.right_weight', function(){
      var par = $(this).parent().find('.w_val');
      var cur = par.html();
      if(checknumber(cur)){
        var newval = parseInt(parseInt(cur)+1);
        if(newval >= 0){
          par.html(newval);
        }
      }
    });

    /*var curr_val_l = $('.weight_text_l').text();
      $("#left_reps").click(function(){
        // showAlert("The paragraph was clicked.");
        var new_val_l = parseInt(curr_val_l)-1;
        curr_val_l = new_val_l
        $('.weight_text_l').text(new_val_l);
      });
      
      var curr_val_l = $('.weight_text_l').text();
      $("#right_reps").click(function(){
        // showAlert("The paragraph was clicked.");
        var new_val_l = parseInt(curr_val_l)+1;
        curr_val_l = new_val_l
        $('.weight_text_l').text(new_val_l);
      });

      var curr_val = $('.weight_text_r').text();
      $("#left_weight").click(function(){
        // showAlert("The paragraph was clicked.");
        var new_val = parseInt(curr_val)-1;
        curr_val = new_val
        $('.weight_text_r').text(new_val);
      });

    var curr_val = $('.weight_text_r').text();
    
    $("#right_weight").click(function(){
       showAlert("The paragraph was clicked.");
      var new_val = parseInt(curr_val)+1;
      curr_val = new_val
      $('.weight_text_r').text(new_val);
    }); */

  
});



function checknumber(val){  
  var anum=/(^\d+$)|(^\d+\.\d+$)/
  if (anum.test(val))
    testresult=true
  else{  
    testresult=false
  }
  return (testresult)
}


function settourslider(){
  // alert('settourslider');
  return 0;
   $.ajax({
      method : 'POST',
      url : apiUrl, 
      data: {method:'get_tourslider'},
      beforeSend:function(){        
        showLoader();
      },
      complete:function(){        
        hideLoader();
      },
      success: function(res){
        var res = JSON.parse(res);
        if(res.error){
          showAlert(res.error);
        }else{ 
          // console.log(res.success.length);
          content = "";
          $.each(res.success, function(index, value){            
            content +='<li class="rn-carousel-slide">'+value.content+'</li>';
          });
           // $('#slidertour').html(content);

        }
      }
    });
}

function returntohome(workoutid){
 db_returntohome(workoutid);
 return 0;

 setTimeout(function(){
  var note = $('#workout_notes').val();  
  $.ajax({
      method:'POST',
      url : apiUrl, 
      data: {id:workoutid,note:note, method:'update_workoutnote'},    
    });

  update_workoutstatus(workoutid);


  $('#clicktoreturn').trigger('click');

 }, 1000);
}

function update_workoutstatus(workoutid){
  // alert('update_workoutstatus');
  return 0;
  // console.log(workoutid);
  $.ajax({
      method:'POST',
      url : apiUrl, 
      data: {id:workoutid,method:'update_workoutstatus'},    
    });
}



function setHelppage(){
  db_setHelppage();
  return 0;       
  var info = window.localStorage.getItem('userinfo');  
  var a = JSON.parse(info); 
  // console.log(a.id);
   setTimeout(function(){
    $.ajax({
      method : 'POST',
      url : apiUrl,
      data:{trainee_id:a.id, method:'get_queries'},
      beforeSend:function(){        
        showLoader();
      },
      complete:function(){        
        hideLoader();
      },
      success:function(res){
        var result = JSON.parse(res);
        if(result.error){
          // showAlert(result.error);
          // $('#querylist').html(content);
          $('#querylistsettings').html('No Help Queries Found.');          
          $('#querylistsettings').css({'margin-top':'30%','font-size':'20px','color':'#fff'});

        }else{
         // console.log(result.success.result);
         var content = "";
          $.each(result.success.result, function(index, value){
            content +='<li><a href="#" onclick="return querydetails('+"'"+value.token2+"'"+')">'+value.subject+'<img src="images/listaee.png"></a></li>'
            // console.log(value.id);
          });
          $('#querylist').html(content);                    
        }
      }
    });  

  }, 1000);

  }


function querydetails(token2){
  db_querydetails(token2);
  return 0;
  $('#onquerypage').trigger('click');
  setTimeout(function(){
    $.ajax({
      method : 'POST',
      url : apiUrl,
      data:{'token2':token2, 'method':'get_query'},
      beforeSend:function(){        
        showLoader();
      },
      complete:function(){        
        hideLoader();
      },
      success:function(res){
        var result = JSON.parse(res);
        $("#support_idd").val(token2);
        if(result.error){
          showAlert(result.error);
        }else{
          // console.log(res);
         var content = "";
         var me = 0;

         var info = window.localStorage.getItem('userinfo');  
         var a = JSON.parse(info); 

          $.each(result.success.conversation, function(index, value){
            content +='<li >'; 
            // console.log(value.send_by+'--'+value.sender_id+'--'+a.id);
            if(value.send_by == 3 && value.sender_id == a.id){
               content += '<div class="by_trainee">'+value.message+'</div></li>';
            }else{
               content += '<div class="by_trainer">'+value.message+'<br><span>'+value.fname+'</span></div></li>';
            } 
            content +='</li>';            
            // console.log(value.id);
          });

          // result.success.support.subject
          $('#querydetails').html(result.success.support.message);
          
          $('#replylist').html(content);

          $("#replylist").scrollTop(5000);
        }
      }
    });  

  }, 1000);
}


function addQuery(){
  db_addQuery();
  return 0;
  var info = window.localStorage.getItem('userinfo');  
  var a = JSON.parse(info);
  var sub = $('#qsub').val();
  var msg = $('#qmsg').val();  

  var flag = 1;
   if(sub != ''){
      $("#qsub").css('border-bottom', '');
  }else{            
    $("#qsub").css('border-bottom', '1px solid red');
    flag = 0;
  }

  if(msg != ''){
      $("#qmsg").css('border-bottom', '');
  }else{            
    $("#qmsg").css('border-bottom', '1px solid red');
    flag = 0;
  }

  if(flag == 1){
    $.ajax({
      method : 'POST',
      url : apiUrl,
      data:{msg:msg, sub:sub, trainee_id:a.id, method:'addquery'},
      beforeSend:function(){        
        showLoader();
      },
      complete:function(){        
        hideLoader();
      },
      success:function(res){
        var result = JSON.parse(res);
        if(result.error){
        showAlert(result.error);
        }else{          
          $('#onhelppage').trigger('click');
        }
      }
    });
  }


}

function next_month(){
  var monthh = parseInt(window.localStorage.getItem('monthh'));
  var yearr = parseInt(window.localStorage.getItem('yearr'));

  if(monthh == 12){
    monthh = 1;
    yearr = yearr + 1;
  }else{
    monthh = monthh + 1 ;
  }

  var currenttDatee = new Date();
  
  var cm = currenttDatee.getMonth() + 1;
  var cy = currenttDatee.getFullYear();

  var nm = date("n", strtotime("+1 month"));
  var ny = date("Y", strtotime("+1 month"));

  var pm = date("n", strtotime("-1 month"));
  var py = date("Y", strtotime("-1 month"));

  // alert(monthh+'\ncm --> '+cm+'\n'+'cy --> '+cy+'\n'+'nm --> '+nm+'\n'+'ny --> '+ny+'\n'+'pm --> '+pm+'\n'+'py --> '+py);

  // if( cm != monthh || cy != yearr ){
  //   if(isOnline()){
  //     window.localStorage.setItem('monthh' , monthh);
  //     window.localStorage.setItem('yearr' , yearr);
  //     ons.slidingMenu.setAbovePage('page8.html');
  //   }
  //   else{
  //     showAlert('Please connect to internet.');
  //     set_today_date();
  //   }
  // }

  if( ( monthh == cm && yearr == cy ) || ( monthh == nm && yearr == ny ) || ( monthh == pm && yearr == py ) ){ // cm == monthh && cy == yearr 
    // set_today_date();
    window.localStorage.setItem('currentMonth', '1');
    window.localStorage.setItem('monthh' , monthh);
    window.localStorage.setItem('yearr' , yearr);
    ons.slidingMenu.setAbovePage('page8.html');
  }
  else{
    if(isOnline()){
      window.localStorage.setItem('currentMonth', '0');
      window.localStorage.setItem('monthh' , monthh);
      window.localStorage.setItem('yearr' , yearr);
      ons.slidingMenu.setAbovePage('page8.html');
    }
    else{
      showAlert('Please connect to internet.');
      set_today_date();
    }
  }


  
}

function prev_month(){

  var monthh = parseInt(window.localStorage.getItem('monthh'));
  var yearr = parseInt(window.localStorage.getItem('yearr'));

  if(monthh == 1){
    monthh = 12;
    yearr = yearr - 1;
  }else{
    monthh = monthh - 1 ;
  }

  
  // window.localStorage.setItem('monthh' , monthh);
  // window.localStorage.setItem('yearr' , yearr);
  
  // ons.slidingMenu.setAbovePage('page8.html');

  var currenttDatee = new Date();
  
  var cm = currenttDatee.getMonth() + 1;
  var cy = currenttDatee.getFullYear();

  var nm = date("n", strtotime("+1 month"));
  var ny = date("Y", strtotime("+1 month"));

  var pm = date("n", strtotime("-1 month"));
  var py = date("Y", strtotime("-1 month"));

  if( ( monthh == cm && yearr == cy ) || ( monthh == nm && yearr == ny ) || ( monthh == pm && yearr == py ) ){ // cm == monthh && cy == yearr 
    // set_today_date();
    window.localStorage.setItem('currentMonth', '1');
    window.localStorage.setItem('monthh' , monthh);
    window.localStorage.setItem('yearr' , yearr);
    ons.slidingMenu.setAbovePage('page8.html');
  }
  else{
    if(isOnline()){
      window.localStorage.setItem('currentMonth', '0');
      window.localStorage.setItem('monthh' , monthh);
      window.localStorage.setItem('yearr' , yearr);
      ons.slidingMenu.setAbovePage('page8.html');
    }
    else{
      showAlert('Please connect to internet.');
      set_today_date();
    }
  }
}

function this_is_not_current_month(){
  // $(".page__content").css('padding-top', $(".onstoolbar").height()+'px');
  $("#clndr").css('padding-top', '40px');
  $("table.cal td").each(function(){
    if($(this).html() != ''){
      var div = $(this).find('div');
      if(div.hasClass('cal-day')){
        div.parent().parent().addClass('donthideme');

        if(div.hasClass('cal-highlight')){
          div.removeClass('cal-highlight');
        }

      }
    }
  });
}

function set_today_date(){
  window.localStorage.setItem('currentMonth', '1');

  var currenttDatee = new Date();

  window.localStorage.setItem('monthh', currenttDatee.getMonth() + 1);
  window.localStorage.setItem('yearr', currenttDatee.getFullYear());

  window.localStorage.setItem('expand', 1);

  ons.slidingMenu.close(); 
  ons.slidingMenu.setAbovePage('page8.html')
}

function trainee_reply(){
  db_trainee_reply();
  return 0;
  var support_idd = $("#support_idd").val();
  var trainee_id = window.localStorage.getItem('userlogin');
  var message = $("#reply_input").val();

  if(message == ''){
    showAlert('Please enter your message.');
  }else{
    $("#reply_input").val('');
    $.ajax({
      method : 'POST',
      url : apiUrl,
      data:{ reply : message , 'token2' : support_idd , trainee_id : trainee_id , method:'trainee_reply'},
      beforeSend:function(){        
        showLoader();
      },
      complete:function(){        
        hideLoader();
      },
      success:function(res){
        var result = JSON.parse(res);
        if(result.error){
          showAlert(result.error);
        }else{
         var content = "";
         var me = 0;

         var info = window.localStorage.getItem('userinfo');  
         var a = JSON.parse(info); 

          $.each(result.success.conversation, function(index, value){
            content +='<li >'; 
            // console.log(value.send_by+'--'+value.sender_id+'--'+a.id);
            if(value.send_by == 3 && value.sender_id == a.id){
               content += '<div class="by_trainee">'+value.message+'</div></li>';
            }else{
               content += '<div class="by_trainer">'+value.message+'<br><span>'+value.fname+'</span></div></li>';
            } 
            content +='</li>';            
          });

          // result.success.support.subject
          $('#querydetails').html(result.success.support.message);
          
          $('#replylist').html(content);

          $("#replylist").scrollTop(5000);
        }
      }
    });
  }
}

function showAlert(msg){
	navigator.notification.alert(
		msg,
		alertDismissed,
		'Trainer Tech',
		'OK'
	);
}

function alertDismissed() {
	// do something
}

$(document).ready(function(){
	// window.localStorage.setItem('userlogin', '');
	// window.localStorage.setItem('user_info', '');
	// window.localStorage.setItem('userinfo', '');
	// window.localStorage.setItem('user_fullname', '');
});

// $(document).on('blur', '#reply_input', function(){
	// trainee_reply();
// });