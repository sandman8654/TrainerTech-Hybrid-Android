var db;
var no_image = './images/no_image.png';
document.addEventListener("deviceready",onDeviceReady,false);
function onDeviceReady() {
	window.localStorage.setItem('thispage', '1');
	document.addEventListener("backbutton", onBackKeyDown, false);
	if(navigator.network && navigator.network.connection.type != Connection.NONE){
		window.localStorage.setItem('online', '1');
	}
	else{
		window.localStorage.setItem('online', '0');
	}

	db = window.openDatabase("trainertechkey","1.0","trainertechkey",9999999);
	db.transaction(initDB,dbError,dbReady);
}

function dbError(e) {
	showAlert("Error processing SQL: "+e.message);
}

function dbReady() {
	db.transaction(function(tx) {
		tx.executeSql("select * from android_key where id = ?", [999], function(tx, results) {
			if(results.rows.length > 0){
				window.localStorage.setItem('thispage', '2');
				window.location = 'monaca_index.html';
			}
			else{
				activate_key();
			}
		})
	},dbError);	
}

function initDB(tx) {
	var sqlite;
	sqlite = "CREATE TABLE IF NOT EXISTS android_key ( id INTEGER PRIMARY KEY )";
	tx.executeSql(sqlite);
}

function showAlert(msg){
	navigator.notification.alert(
		msg,
		alertDismissed,
		'Trainer Tech',
		'OK'
	);
}

function showAlertError(msg){
	navigator.notification.alert(
		msg,
		activate_key,
		'Trainer Tech',
		'OK'
	);
}

function alertDismissed() {
	// do something
}

function onBackKeyDown(event) {
	
}

function activate_key(){
	navigator.notification.prompt(
	    'Please enter activation key',
	    onPrompt,
	    'Trainer Tech',
	    ['Submit'],
	    'Activation key enter here'
	);
}

function onPrompt(results) {
	var key = results.input1;
	if(key == 'Activation key enter here'){
		showAlertError('Please enter activation key.');
	}
	else{
		$.ajax({
			url : 'http://www.trainertechnologyapp.com/android_keys/activate',
			type : 'POST',
			data : {
				'key' : key
			},
			error : function(){
				showAlertError('Some problem occured.');
			},
			success : function(res){
				if(res.error){
					showAlertError(res.error);
				}
				else{
					showAlert(res.success);
					db.transaction(function(tx) {
						tx.executeSql("insert into android_key (id) values (?)", [999], function(tx, results) {
							window.localStorage.setItem('thispage', '2');
							window.location = 'monaca_index.html';
						})
					},dbError);
				}
			}
		});
	}
}