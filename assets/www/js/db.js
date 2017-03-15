var syncTimerVar;

function get_timestamp(){
	var d = new Date();
	return parseInt(d.getTime()/1000);
}

function get_token() {
	var length = 100;
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'+get_timestamp();
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}

function isOnline(){
	if(window.localStorage.getItem('online') == '1'){
		return true;
	}
	else{
		return false;
	}
}

function startupdb() {
	db = window.openDatabase("trainertech","1.0","trainertech",9999999);
	db.transaction(initDB,dbError,dbReady);
}

function dbError(e) {
	// showAlert("Error processing SQL: "+e.message);
}

function dbReady() {
	// begin sync process
	// if(navigator.network && navigator.network.connection.type != Connection.NONE)
	// 	onOnline();
	// else
	// 	displayList();

	// db.transaction(function(uutx) {
	// 	uutx.executeSql("DELETE FROM `workout` WHERE `id` IN (15)")
	// });

	// return 0;

	var curentDate = new Date();
	var curentMonth = curentDate.getMonth() + 1;
	var curentYear = curentDate.getFullYear();

	var firstq = date("Y-m-%", get_timestamp());
	var secondq = date("Y-m-%", strtotime("+1 month"));
	var thirdq = date("Y-m-%", strtotime("-1 month"));

	// alert(firstq);
	// alert(secondq);
	// alert(thirdq);

	// return 0;

	// var sqlite = "SELECT `id` FROM `workout` WHERE `date` NOT LIKE '%-"+curentMonth+"-%'";
	var sqlite = "SELECT `id` FROM `workout` WHERE (`date` NOT LIKE '"+firstq+"') AND (`date` NOT LIKE '"+secondq+"') AND (`date` NOT LIKE '"+thirdq+"')";
	// showAlert(sqlite);

	// return 0;

	db.transaction(function(tx) {
		tx.executeSql(sqlite, [], function(tx, results) {
			if(results.rows.length == 0){
				return false;
			}

			var workout_ids = [];
			for(var i=0; i<results.rows.length; i++) {
				workout_ids.push(results.rows.item(i).id);
			}

			sqlite = "SELECT `id` FROM `exercise` WHERE `workout_id` IN ("+workout_ids.join(',')+")";

			var deleteQuery = "DELETE FROM `workout` WHERE `id` IN ("+workout_ids.join(',')+"); ";
			
			deleteQuery += "DELETE FROM `circuit` WHERE `workout_id` IN ("+workout_ids.join(',')+"); ";

			// deleteQuery += " DELETE FROM `workout_notes` WHERE `workout_id` IN ("+workout_ids.join(',')+"); ";

			tx.executeSql(sqlite, [], function(tx, results) {
				if(results.rows.length == 0){
					db.transaction(function(dtx) {
						dtx.executeSql(deleteQuery);
					});
					// showAlert(deleteQuery);
				}
				else{


					var exercise_ids = [];
					for(var i=0; i<results.rows.length; i++) {
						exercise_ids.push(results.rows.item(i).id);
					}

					deleteQuery += " DELETE FROM `exercise` WHERE `id` IN ("+exercise_ids.join(',')+"); ";

					// deleteQuery += " DELETE FROM `exercise_notes` WHERE `exercise_id` IN ("+exercise_ids.join(',')+"); ";

					deleteQuery += " DELETE FROM `exercise_set` WHERE `exercise_id` IN ("+exercise_ids.join(',')+"); ";

					sqlite = "SELECT `id` FROM `exercise_set` WHERE `exercise_id` IN ("+exercise_ids.join(',')+")";

					tx.executeSql(sqlite, [], function(tx, results) {
						if(results.rows.length == 0){
							db.transaction(function(dtx) {
								dtx.executeSql(deleteQuery);
							});
							// showAlert(deleteQuery);
						}
						else{
							var exercise_set_ids = [];
							for(var i=0; i<results.rows.length; i++) {
								exercise_set_ids.push(results.rows.item(i).id);
							}

							// deleteQuery += " DELETE FROM `exercise_set_results` WHERE `exercise_set_id` IN ("+exercise_set_ids.join(',')+"); ";

							db.transaction(function(dtx) {
								dtx.executeSql(deleteQuery);
							});
							// showAlert(deleteQuery);
						}
					});
				}
			})
		})
	});
}

function initDB(tx) {
	var sqlite;
	
	/*
	tx.executeSql("drop table conversation");
	tx.executeSql("drop table exercise");
	tx.executeSql("drop table exercise_set");
	tx.executeSql("drop table support");
	tx.executeSql("drop table trainee");
	tx.executeSql("drop table trainee_workout");
	tx.executeSql("drop table trainer");
	tx.executeSql("drop table workout");
	tx.executeSql("drop table workout_notes");
	tx.executeSql("drop table exercise_notes");
	tx.executeSql("drop table exercise_set_results");
	showAlert('DROP');
	/*
	return ;
	*/

	sqlite = "CREATE TABLE IF NOT EXISTS conversation ( id INTEGER PRIMARY KEY AUTOINCREMENT, support_id TEXT, support_token2 TEXT, message TEXT, sender_id TEXT, reciver_id TEXT, send_by TEXT, recieve_by TEXT, created TEXT, token TEXT, lastupdated TEXT )";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS exercise ( id INTEGER PRIMARY KEY AUTOINCREMENT, circuit_id TEXT, notes TEXT, workout_id TEXT, name TEXT, description TEXT, timetaken TEXT, resttime TEXT, image TEXT,base64image TEXT, status TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS exercise_set ( id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id TEXT, time TEXT, value TEXT, reps TEXT, resultweight TEXT, timetaken TEXT, resultreps TEXT, set_status TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS support ( id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT, trainer_id TEXT, trainer_name TEXT, trainer_email TEXT, trainee_id TEXT, trainee_name TEXT, trainee_email TEXT, by TEXT, subject TEXT, message TEXT, status TEXT, is_read TEXT, created TEXT, updated TEXT, token2 TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS trainee ( id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT, trainer_id TEXT, fname TEXT, lname TEXT, email TEXT, image TEXT, newimage TEXT, base64image TEXT, currentweight TEXT, height TEXT, goalweight TEXT, password TEXT, address TEXT, city TEXT, state TEXT, phone TEXT, zip TEXT, forgot_pwd TEXT, forgot_pwd_key TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS trainee_workout ( id INTEGER PRIMARY KEY AUTOINCREMENT, trainee_id TEXT, workout_id TEXT, is_group TEXT, group_id TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS trainer ( id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT, fname TEXT, lname TEXT, email TEXT, password TEXT, address TEXT, city TEXT, state TEXT, phone TEXT, zip TEXT, forgot_pwd TEXT, forgot_pwd_key TEXT, status TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS workout ( id INTEGER PRIMARY KEY AUTOINCREMENT, notes TEXT, trainer_id TEXT, trainee_id TEXT, date TEXT, time TEXT, name TEXT, description TEXT, image TEXT, base64image TEXT, cbase64image TEXT, status TEXT, created TEXT, updated TEXT, type TEXT, circuit_name TEXT, circuit_description TEXT, circuit_image TEXT, token TEXT, lastupdated TEXT, anytime TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS circuit ( id INTEGER PRIMARY KEY AUTOINCREMENT, workout_id TEXT, name TEXT, description TEXT, image TEXT,base64image TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);

	sqlite = "CREATE TABLE IF NOT EXISTS workout_notes ( id INTEGER PRIMARY KEY AUTOINCREMENT, workout_id TEXT, trainee_id TEXT, notes TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT )";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS exercise_notes ( id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id TEXT, trainee_id TEXT, notes TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT )";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS exercise_set_results ( id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_set_id TEXT, resulttime TEXT, resultweight TEXT, timetaken TEXT, resultreps TEXT, trainee_id TEXT, status TEXT, token TEXT, created TEXT, updated TEXT, lastupdated TEXT )";
	tx.executeSql(sqlite);

	// var loginsession = window.localStorage.getItem("userlogin");
	// if(loginsession){
	// 	setTimeout(function(){
	// 		if(isOnline()){
	// 			$("#onsyncpage").trigger('click');
	// 		}
	// 	},1000);
	// }
	
	/*
	if(navigator.network && navigator.network.connection.type != Connection.NONE){
		var loginsession = window.localStorage.getItem("userlogin");
		if(loginsession){
			// syncConversation();
			// syncSupport();
			// syncTrainee();
			// syncTrainer();
			// syncTraineeWorkout();
			// syncWorkout();
			// syncExercise();
			// syncExerciseSet();

        	// displayAll();
        }
	}
	// else
	// 	alert('offline');
	*/
}

function syncDB(tx){
	var sqlite;

	// tx.executeSql("drop table conversation");
	// tx.executeSql("drop table exercise");
	// tx.executeSql("drop table exercise_set");
	// tx.executeSql("drop table support");
	// tx.executeSql("drop table trainee");
	// tx.executeSql("drop table trainee_workout");
	// tx.executeSql("drop table trainer");
	// tx.executeSql("drop table workout");	

	sqlite = "CREATE TABLE IF NOT EXISTS conversation ( id INTEGER PRIMARY KEY AUTOINCREMENT, support_id TEXT, support_token2 TEXT, message TEXT, sender_id TEXT, reciver_id TEXT, send_by TEXT, recieve_by TEXT, created TEXT, token TEXT, lastupdated TEXT )";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS exercise ( id INTEGER PRIMARY KEY AUTOINCREMENT, circuit_id TEXT, notes TEXT, workout_id TEXT, name TEXT, description TEXT, timetaken TEXT, resttime TEXT, image TEXT,base64image TEXT, status TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS exercise_set ( id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id TEXT, time TEXT, value TEXT, reps TEXT, resultweight TEXT, timetaken TEXT, resultreps TEXT, set_status TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS support ( id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT, trainer_id TEXT, trainer_name TEXT, trainer_email TEXT, trainee_id TEXT, trainee_name TEXT, trainee_email TEXT, by TEXT, subject TEXT, message TEXT, status TEXT, is_read TEXT, created TEXT, updated TEXT, token2 TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS trainee ( id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT, trainer_id TEXT, fname TEXT, lname TEXT, email TEXT, image TEXT, newimage TEXT, base64image TEXT, currentweight TEXT, height TEXT, goalweight TEXT, password TEXT, address TEXT, city TEXT, state TEXT, phone TEXT, zip TEXT, forgot_pwd TEXT, forgot_pwd_key TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS trainee_workout ( id INTEGER PRIMARY KEY AUTOINCREMENT, trainee_id TEXT, workout_id TEXT, is_group TEXT, group_id TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS trainer ( id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT, fname TEXT, lname TEXT, email TEXT, password TEXT, address TEXT, city TEXT, state TEXT, phone TEXT, zip TEXT, forgot_pwd TEXT, forgot_pwd_key TEXT, status TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS workout ( id INTEGER PRIMARY KEY AUTOINCREMENT, notes TEXT, trainer_id TEXT, trainee_id TEXT, date TEXT, time TEXT, name TEXT, description TEXT, image TEXT, base64image TEXT, cbase64image TEXT, status TEXT, created TEXT, updated TEXT, type TEXT, circuit_name TEXT, circuit_description TEXT, circuit_image TEXT, token TEXT, lastupdated TEXT, anytime TEXT)";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS circuit ( id INTEGER PRIMARY KEY AUTOINCREMENT, workout_id TEXT, name TEXT, description TEXT, image TEXT,base64image TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT)";
	tx.executeSql(sqlite);

	sqlite = "CREATE TABLE IF NOT EXISTS workout_notes ( id INTEGER PRIMARY KEY AUTOINCREMENT, workout_id TEXT, trainee_id TEXT, notes TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT )";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS exercise_notes ( id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id TEXT, trainee_id TEXT, notes TEXT, created TEXT, updated TEXT, token TEXT, lastupdated TEXT )";
	tx.executeSql(sqlite);
	sqlite = "CREATE TABLE IF NOT EXISTS exercise_set_results ( id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_set_id TEXT, resulttime TEXT, resultweight TEXT, timetaken TEXT, resultreps TEXT, trainee_id TEXT, status TEXT, token TEXT, created TEXT, updated TEXT, lastupdated TEXT )";
	tx.executeSql(sqlite);

	syncConversation();
	syncSupport();
	syncTrainee();
	syncTrainer();
	syncTraineeWorkout();
	syncWorkout();
	syncExercise();
	syncCircuit();
	syncExerciseSet();
	syncWorkoutNotes();
	syncExerciseNotes();
	syncExerciseSetResults();
}

function syncTimer(){
	var check_send = $("#request_send").val();
	var check_get = $("#request_get").val();
	var check_table_data_send = parseInt($("#table_data_send").val());
	var check_table_data_get = parseInt($("#table_data_get").val());

	if(check_table_data_send == check_table_data_get){
		if(check_send == 'SEND' && check_get == 'GET')
			syncEnd();
	}

	check_send = parseInt($("#request_send").val());
	check_get = parseInt($("#request_get").val());

	if(check_send == check_get){
		check_table_data_send = parseInt($("#table_data_send").val());
		check_table_data_get = parseInt($("#table_data_get").val());
		if(check_table_data_send == check_table_data_get){
			syncEnd();
		}
	}

	var closeSync = $("#closeSync").val();
	if(closeSync !== 'TRUE'){
		hideLoader();
		syncEnd();
	}

}

function sync_db(){
	var loginsession = window.localStorage.getItem("userlogin");
	if(isOnline && loginsession){
		var userid = window.localStorage.getItem("userlogin");
		var trainer_id = window.localStorage.getItem("trainer_id");
		showLoader();
		db.transaction(syncDB,dbError);

		syncTimerVar = setInterval(function(){ syncTimer() }, 10);

		setTimeout(function(){
			var closeSync = $("#closeSync").val();
			if(closeSync === 'TRUE'){
				syncEnd();
			}
		},(1000 * 60 * 2));
	}
	else{
		syncEnd();
	}
}

function syncEnd(){
	var closeSync = $("#closeSync").val();
	if(closeSync === 'TRUE'){
		hideLoader();
		// $("#oncalpage").trigger('click');
		set_today_date();
	}
	clearInterval(syncTimerVar);
}

function syncConversation() {
	var userid = window.localStorage.getItem("userlogin");
	var trainer_id = window.localStorage.getItem("trainer_id");
	var s='';
	
	db.transaction(function(tx) {
		tx.executeSql("select * from conversation where sender_id = ? OR reciver_id = ?", [userid, trainer_id], function(tx, results) {
	
			var conversation = [];
			s = '';
			for(var i=0; i<results.rows.length; i++) {
				s = '';
				s += results.rows.item(i).id;
				s += '_--_'+results.rows.item(i).support_id;
				s += '_--_'+results.rows.item(i).support_token2;
				s += '_--_'+results.rows.item(i).message;
				s += '_--_'+results.rows.item(i).sender_id;
				s += '_--_'+results.rows.item(i).reciver_id;
				s += '_--_'+results.rows.item(i).send_by;
				s += '_--_'+results.rows.item(i).recieve_by;
				s += '_--_'+results.rows.item(i).created;
				s += '_--_'+results.rows.item(i).token;
				s += '_--_'+results.rows.item(i).lastupdated;
				conversation.push(s);
			}

			var conversation = conversation.join('__----__');

			$.ajax({
				method : 'POST',
      			url : apiUrl,
				data : { 'method' : 'sync_conversation' , 'trainee_id' : userid , 'trainer_id' : trainer_id , 'conversation' : conversation },
				type : 'POST',
				beforeSend : function(){
					var td_send = $("#table_data_send").val();
					if(td_send == 'SEND'){
						$("#table_data_send").val('0');
					}else{
						td_send = parseInt(td_send);
						$("#table_data_send").val(parseInt( td_send + 1));
					}
				},
				error : function(){
					syncEnd();
				},
				success : function(resp){

					res = JSON.parse(resp);

					if(res.success){
						var response = res.success.data;
						if(response){	
							$.each(response, function(index, ob){
								// alert(ob.token);
								db.transaction(function(ctx) {
									ctx.executeSql("select * from conversation where token = ?", [ob.token], function(ctx,checkres) {
										db.transaction(function(ptx) {
											if(checkres.rows.length) {
												ptx.executeSql("update conversation set support_id=?,support_token2=?,message=?,sender_id=?,reciver_id=?,send_by=?,recieve_by=?,created=?,lastupdated=? where token=?", [ob.support_id, ob.support_token2, ob.message, ob.sender_id, ob.reciver_id, ob.send_by, ob.recieve_by, ob.created, ob.lastupdated, ob.token]);
											} else {
												ptx.executeSql("insert into conversation(support_id,support_token2, message, sender_id, reciver_id, send_by, recieve_by, created, token, lastupdated) values(?,?,?,?,?,?,?,?,?,?)", [ob.support_id, ob.support_token2, ob.message, ob.sender_id, ob.reciver_id, ob.send_by, ob.recieve_by, ob.created, ob.token, ob.lastupdated]);
											}
										},dbError);
									});
								},dbError);
							});
						}
						setTimeout(function(){
							displayList();
							// alert('conversation');
						},1000);
					}else{
						showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncSupport() {
	var trainee_id = window.localStorage.getItem("userlogin");
	var trainer_id = window.localStorage.getItem("trainer_id");
	var s='';
	
	db.transaction(function(tx) {
		tx.executeSql("select * from support where trainee_id = ?", [trainee_id], function(tx, results) {
	
			var syncData = [];
			s = '';
			for(var i=0; i<results.rows.length; i++) {
				s = '';
				s += results.rows.item(i).id;
				s += '_--_'+results.rows.item(i).token;
				s += '_--_'+results.rows.item(i).trainer_id;
				s += '_--_'+results.rows.item(i).trainer_name;
				s += '_--_'+results.rows.item(i).trainer_email;
				s += '_--_'+results.rows.item(i).trainee_id;
				s += '_--_'+results.rows.item(i).trainee_name;
				s += '_--_'+results.rows.item(i).trainee_email;
				s += '_--_'+results.rows.item(i).by;
				s += '_--_'+results.rows.item(i).subject;
				s += '_--_'+results.rows.item(i).message;
				s += '_--_'+results.rows.item(i).status;
				s += '_--_'+results.rows.item(i).is_read;
				s += '_--_'+results.rows.item(i).created;
				s += '_--_'+results.rows.item(i).updated;
				s += '_--_'+results.rows.item(i).token2;
				s += '_--_'+results.rows.item(i).lastupdated;
				syncData.push(s);
			}

			var syncData = syncData.join('__----__');

			$.ajax({
				method : 'POST',
      			url : apiUrl,
				data : { 'method' : 'sync_support' , 'trainee_id' : trainee_id , 'syncData' : syncData },
				type : 'POST',
				beforeSend : function(){
					var td_send = $("#table_data_send").val();
					if(td_send == 'SEND'){
						$("#table_data_send").val('0');
					}else{
						td_send = parseInt(td_send);
						$("#table_data_send").val(parseInt( td_send + 1));
					}
				},
				error : function(){
					syncEnd();
				},
				success : function(resp){

					res = JSON.parse(resp);

					if(res.success){
						var response = res.success.data;
						if(response){	
							$.each(response, function(index, ob){
								// alert(ob.token);
								db.transaction(function(ctx) {
									ctx.executeSql("select * from support where token2 = ?", [ob.token2], function(ctx,checkres) {
										db.transaction(function(ptx) {
											if(checkres.rows.length) {
												ptx.executeSql("update support set token=?, trainer_id=?, trainer_name=?, trainer_email=?, trainee_id=?, trainee_name=?, trainee_email=?, by=?, subject=?, message=?, status=?, is_read=?, created=?, updated=?, lastupdated=? where token2=?", [ob.token, ob.trainer_id, ob.trainer_name, ob.trainer_email, ob.trainee_id, ob.trainee_name, ob.trainee_email, ob.by, ob.subject, ob.message, ob.status, ob.is_read, ob.created, ob.updated, ob.lastupdated, ob.token2]);
											} else {
												ptx.executeSql("insert into support(token, trainer_id, trainer_name, trainer_email, trainee_id, trainee_name, trainee_email, by, subject, message, status, is_read, created, updated, lastupdated, token2) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [ob.token, ob.trainer_id, ob.trainer_name, ob.trainer_email, ob.trainee_id, ob.trainee_name, ob.trainee_email, ob.by, ob.subject, ob.message, ob.status, ob.is_read, ob.created, ob.updated, ob.lastupdated, ob.token2]);
											}
										},dbError);
									});
								},dbError);
							});
						}
						setTimeout(function(){
							displayList();
							// alert('support');
						},1000);
					}else{
						showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncTrainee() {
	var trainee_id = window.localStorage.getItem("userlogin");
	var s='';
	
	db.transaction(function(tx) {
		tx.executeSql("select * from trainee where id = ?", [trainee_id], function(tx, results) {
	
			var syncData = [];
			s = '';
			for(var i=0; i<results.rows.length; i++) {
				s = '';
				s += results.rows.item(i).id;
				s += '_--_'+results.rows.item(i).slug;
				s += '_--_'+results.rows.item(i).trainer_id;
				s += '_--_'+results.rows.item(i).fname;
				s += '_--_'+results.rows.item(i).lname;
				s += '_--_'+results.rows.item(i).email;
				s += '_--_'+results.rows.item(i).image;
				s += '_--_'+results.rows.item(i).currentweight;
				s += '_--_'+results.rows.item(i).height;
				s += '_--_'+results.rows.item(i).goalweight;
				s += '_--_'+results.rows.item(i).password;
				s += '_--_'+results.rows.item(i).address;
				s += '_--_'+results.rows.item(i).city;
				s += '_--_'+results.rows.item(i).state;
				s += '_--_'+results.rows.item(i).phone;
				s += '_--_'+results.rows.item(i).zip;
				s += '_--_'+results.rows.item(i).forgot_pwd;
				s += '_--_'+results.rows.item(i).forgot_pwd_key;
				s += '_--_'+results.rows.item(i).created;
				s += '_--_'+results.rows.item(i).updated;
				s += '_--_'+results.rows.item(i).token;
				s += '_--_'+results.rows.item(i).newimage;
				s += '_--_'+results.rows.item(i).lastupdated;
				syncData.push(s);
			}

			var syncData = syncData.join('__----__');

			$.ajax({
				method : 'POST',
      			url : apiUrl,
				data : { 'method' : 'sync_trainee' , 'trainee_id' : trainee_id , 'syncData' : syncData },
				type : 'POST',
				beforeSend : function(){
					var td_send = $("#table_data_send").val();
					if(td_send == 'SEND'){
						$("#table_data_send").val('0');
					}else{
						td_send = parseInt(td_send);
						$("#table_data_send").val(parseInt( td_send + 1));
					}
				},
				error : function(){
					syncEnd();
				},
				success : function(resp){

					res = JSON.parse(resp);

					if(res.success){
						var response = res.success.data;
						if(response){	
							$.each(response, function(index, ob){
								// alert(ob.token);
								db.transaction(function(ctx) {
									ctx.executeSql("delete from trainee where id = ?", [ob.id], function(ctx) {
										// db.transaction(function(ptx) {
											ctx.executeSql("insert into trainee(id, slug, trainer_id, fname, lname, email, image, newimage, base64image, currentweight, height, goalweight, password, address, city, state, phone, zip, forgot_pwd, forgot_pwd_key, created, updated, lastupdated, token) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [ob.id, ob.slug, ob.trainer_id, ob.fname, ob.lname, ob.email, ob.image, '',ob.base64image, ob.currentweight, ob.height, ob.goalweight, ob.password, ob.address, ob.city, ob.state, ob.phone, ob.zip, ob.forgot_pwd, ob.forgot_pwd_key, ob.created, ob.updated, ob.lastupdated, ob.token]);
											
											var id = ob.id;
											// var image = './assets/uploads/trainee/'+ob.image;
											var image = ob.image;
											var tablename = 'trainee';
											insertBase64Image(id, image, tablename);

											updateSessioninfo();

										// },dbError);
									});
								},dbError);
							});
						}
						setTimeout(function(){
							displayList();
							// alert('trainee');
						},1000);
					}else{
						showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncTrainer() {
	var trainer_id = window.localStorage.getItem("trainer_id");
	var s='';
	
	db.transaction(function(tx) {
		tx.executeSql("select * from trainer where id = ?", [trainer_id], function(tx, results) {
	
			var syncData = [];
			s = '';
			for(var i=0; i<results.rows.length; i++) {
				s = '';
				s += results.rows.item(i).id;
				s += '_--_'+results.rows.item(i).slug;
				s += '_--_'+results.rows.item(i).fname;
				s += '_--_'+results.rows.item(i).lname;
				s += '_--_'+results.rows.item(i).email;
				s += '_--_'+results.rows.item(i).password;
				s += '_--_'+results.rows.item(i).address;
				s += '_--_'+results.rows.item(i).city;
				s += '_--_'+results.rows.item(i).state;
				s += '_--_'+results.rows.item(i).phone;
				s += '_--_'+results.rows.item(i).zip;
				s += '_--_'+results.rows.item(i).forgot_pwd;
				s += '_--_'+results.rows.item(i).forgot_pwd_key;
				s += '_--_'+results.rows.item(i).status;
				s += '_--_'+results.rows.item(i).created;
				s += '_--_'+results.rows.item(i).updated;
				s += '_--_'+results.rows.item(i).token;
				s += '_--_'+results.rows.item(i).lastupdated;
				syncData.push(s);
			}

			var syncData = syncData.join('__----__');

			$.ajax({
				method : 'POST',
      			url : apiUrl,
				data : { 'method' : 'sync_trainer' , 'trainer_id' : trainer_id , 'syncData' : syncData },
				type : 'POST',
				beforeSend : function(){
					var td_send = $("#table_data_send").val();
					if(td_send == 'SEND'){
						$("#table_data_send").val('0');
					}else{
						td_send = parseInt(td_send);
						$("#table_data_send").val(parseInt( td_send + 1));
					}
				},
				error : function(){
					syncEnd();
				},
				success : function(resp){

					res = JSON.parse(resp);

					if(res.success){
						var response = res.success.data;
						if(response){	
							$.each(response, function(index, ob){
								// alert(ob.token);
								db.transaction(function(ctx) {
									ctx.executeSql("delete from trainer where id = ?", [ob.id], function(ctx) {
										// db.transaction(function(ptx) {
											ctx.executeSql("insert into trainer(id, slug, fname, lname, email, password, address, city, state, phone, zip, forgot_pwd, forgot_pwd_key, status, created, updated, lastupdated, token) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [ob.id, ob.slug, ob.fname, ob.lname, ob.email, ob.password, ob.address, ob.city, ob.state, ob.phone, ob.zip, ob.forgot_pwd, ob.forgot_pwd_key, ob.status, ob.created, ob.updated, ob.lastupdated, ob.token]);
										// },dbError);
									});
								},dbError);
							});
						}
						setTimeout(function(){
							displayList();
							// alert('trainer');
						},1000);
					}else{
						showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncWorkoutNotes() {
	var trainee_id = window.localStorage.getItem("userlogin");
	var s='';
	
	db.transaction(function(tx) {
		tx.executeSql("select * from workout_notes where trainee_id = ? or trainee_id = ? ", [trainee_id, trainee_id+'.0'], function(tx, results) {
	
			var syncData = [];
			s = '';
			for(var i=0; i<results.rows.length; i++) {
				s = '';
				s += results.rows.item(i).id;
				s += '_--_'+results.rows.item(i).workout_id;
				s += '_--_'+results.rows.item(i).trainee_id;
				s += '_--_'+results.rows.item(i).notes;
				s += '_--_'+results.rows.item(i).created;
				s += '_--_'+results.rows.item(i).updated;
				s += '_--_'+results.rows.item(i).token;
				s += '_--_'+results.rows.item(i).lastupdated;
				syncData.push(s);
			}

			var syncData = syncData.join('__----__');

			$.ajax({
				method : 'POST',
      			url : apiUrl,
				data : { 'method' : 'sync_workout_notes' , 'trainee_id' : trainee_id , 'syncData' : syncData },
				type : 'POST',
				beforeSend : function(){
					var td_send = $("#table_data_send").val();
					if(td_send == 'SEND'){
						$("#table_data_send").val('0');
					}else{
						td_send = parseInt(td_send);
						$("#table_data_send").val(parseInt( td_send + 1));
					}
				},
				error : function(){
					syncEnd();
				},
				success : function(resp){

					res = JSON.parse(resp);

					if(res.success){
						var response = res.success.data;
						if(response){	
							$.each(response, function(index, ob){
								db.transaction(function(ctx) {
									ctx.executeSql("delete from workout_notes where token = ?", [ob.token], function(ctx) {
										// db.transaction(function(ptx) {
											ctx.executeSql("insert into workout_notes(workout_id, trainee_id, notes, created, updated, token, lastupdated) values(?,?,?,?,?,?,?)", [ob.workout_id, ob.trainee_id, ob.notes, ob.created, ob.updated, ob.token, ob.lastupdated]);
										// },dbError);
									});
								},dbError);
							});
						}
						setTimeout(function(){
							displayList();
							// alert('trainer');
						},1000);
					}else{
						showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncExerciseNotes() {
	var trainee_id = window.localStorage.getItem("userlogin");
	var s='';
	
	db.transaction(function(tx) {
		tx.executeSql("select * from exercise_notes where trainee_id = ? or trainee_id = ? ", [trainee_id, trainee_id+'.0'], function(tx, results) {
	
			var syncData = [];
			s = '';
			for(var i=0; i<results.rows.length; i++) {
				s = '';
				s += results.rows.item(i).id;
				s += '_--_'+results.rows.item(i).exercise_id;
				s += '_--_'+results.rows.item(i).trainee_id;
				s += '_--_'+results.rows.item(i).notes;
				s += '_--_'+results.rows.item(i).created;
				s += '_--_'+results.rows.item(i).updated;
				s += '_--_'+results.rows.item(i).token;
				s += '_--_'+results.rows.item(i).lastupdated;
				syncData.push(s);
			}

			var syncData = syncData.join('__----__');

			$.ajax({
				method : 'POST',
      			url : apiUrl,
				data : { 'method' : 'sync_exercise_notes' , 'trainee_id' : trainee_id , 'syncData' : syncData },
				type : 'POST',
				beforeSend : function(){
					var td_send = $("#table_data_send").val();
					if(td_send == 'SEND'){
						$("#table_data_send").val('0');
					}else{
						td_send = parseInt(td_send);
						$("#table_data_send").val(parseInt( td_send + 1));
					}
				},
				error : function(){
					syncEnd();
				},
				success : function(resp){

					res = JSON.parse(resp);

					if(res.success){
						var response = res.success.data;
						if(response){	
							$.each(response, function(index, ob){
								db.transaction(function(ctx) {
									ctx.executeSql("delete from exercise_notes where token = ?", [ob.token], function(ctx) {
										// db.transaction(function(ptx) {
											ctx.executeSql("insert into exercise_notes(exercise_id, trainee_id, notes, created, updated, token, lastupdated) values(?,?,?,?,?,?,?)", [ob.exercise_id, ob.trainee_id, ob.notes, ob.created, ob.updated, ob.token, ob.lastupdated]);
										// },dbError);
									});
								},dbError);
							});
						}
						setTimeout(function(){
							displayList();
							// alert('trainer');
						},1000);
					}else{
						showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncExerciseSetResults() {
	var trainee_id = window.localStorage.getItem("userlogin");
	var s='';
	
	db.transaction(function(tx) {
		tx.executeSql("select * from exercise_set_results where trainee_id = ? or trainee_id = ? ", [trainee_id, trainee_id+'.0'], function(tx, results) {
	
			var syncData = [];
			s = '';
			for(var i=0; i<results.rows.length; i++) {
				s = '';
				s += results.rows.item(i).id;
				s += '_--_'+results.rows.item(i).exercise_set_id;
				s += '_--_'+results.rows.item(i).resultweight;
				s += '_--_'+results.rows.item(i).timetaken;
				s += '_--_'+results.rows.item(i).resultreps;
				s += '_--_'+results.rows.item(i).trainee_id;
				s += '_--_'+results.rows.item(i).status;
				s += '_--_'+results.rows.item(i).token;
				s += '_--_'+results.rows.item(i).created;
				s += '_--_'+results.rows.item(i).updated;
				s += '_--_'+results.rows.item(i).resulttime;
				s += '_--_'+results.rows.item(i).lastupdated;
				syncData.push(s);
			}

			var syncData = syncData.join('__----__');

			$.ajax({
				method : 'POST',
      			url : apiUrl,
				data : { 'method' : 'sync_exercise_set_results' , 'trainee_id' : trainee_id , 'syncData' : syncData },
				type : 'POST',
				beforeSend : function(){
					var td_send = $("#table_data_send").val();
					if(td_send == 'SEND'){
						$("#table_data_send").val('0');
					}else{
						td_send = parseInt(td_send);
						$("#table_data_send").val(parseInt( td_send + 1));
					}
				},
				error : function(){
					syncEnd();
				},
				success : function(resp){

					res = JSON.parse(resp);

					if(res.success){
						var response = res.success.data;
						if(response){	
							$.each(response, function(index, ob){
								db.transaction(function(ctx) {
									ctx.executeSql("delete from exercise_set_results where token = ?", [ob.token], function(ctx) {
										// db.transaction(function(ptx) {
											ctx.executeSql("insert into exercise_set_results(exercise_set_id, resultweight, resulttime, timetaken, resultreps, trainee_id, status, token, created, updated, lastupdated) values(?,?,?,?,?,?,?,?,?,?,?)", [ob.exercise_set_id, ob.resultweight, ob.resulttime, ob.timetaken, ob.resultreps, ob.trainee_id, ob.status, ob.token, ob.created, ob.updated, ob.lastupdated]);
										// },dbError);
									});
								},dbError);
							});
						}
						setTimeout(function(){
							displayList();
							// alert('trainer');
						},1000);
					}else{
						showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncTraineeWorkout() {
	var userid = window.localStorage.getItem("userlogin");
	var s='';
	
	db.transaction(function(tx) {
		tx.executeSql("select * from trainee_workout where trainee_id = ?", [userid], function(tx, results) {
	
			var trainee_workout = [];
			s = '';
			for(var i=0; i<results.rows.length; i++) {
				s = '';
				s += results.rows.item(i).id;
				s += '_--_'+results.rows.item(i).trainee_id;
				s += '_--_'+results.rows.item(i).workout_id;
				s += '_--_'+results.rows.item(i).is_group;
				s += '_--_'+results.rows.item(i).group_id;
				s += '_--_'+results.rows.item(i).created;
				s += '_--_'+results.rows.item(i).updated;
				s += '_--_'+results.rows.item(i).token;
				s += '_--_'+results.rows.item(i).lastupdated;
				trainee_workout.push(s);
			}

			var trainee_workout = trainee_workout.join('__----__');

			$.ajax({
				method : 'POST',
      			url : apiUrl,
				data : { 'method' : 'sync_trainee_workout' , 'trainee_id' : userid , 'trainee_workout' : trainee_workout },
				type : 'POST',
				beforeSend : function(){
					var td_send = $("#table_data_send").val();
					if(td_send == 'SEND'){
						$("#table_data_send").val('0');
					}else{
						td_send = parseInt(td_send);
						$("#table_data_send").val(parseInt( td_send + 1));
					}
				},
				error : function(){
					syncEnd();
				},
				success : function(resp){

					res = JSON.parse(resp);

					if(res.success){
						var response = res.success.data;
						if(response){	
							$.each(response, function(index, ob){
								// alert(ob.token);
								db.transaction(function(ctx) {
									ctx.executeSql("delete from trainee_workout where id = ?", [ob.id], function(ctx) {
										// db.transaction(function(ptx) {
											ctx.executeSql("insert into trainee_workout(id,trainee_id,workout_id,is_group,group_id,created,updated,token,lastupdated) values(?,?,?,?,?,?,?,?,?)", [ob.id, ob.trainee_id, ob.workout_id, ob.is_group, ob.group_id, ob.created, ob.updated, ob.token, ob.lastupdated]);
										// },dbError);
									});
								},dbError);
							});
						}

						if(res.success.delete_ids){
							$.each(res.success.delete_ids, function(i,v){
								db.transaction(function(ctx) {
									ctx.executeSql("DELETE FROM trainee_workout where id = ?", [v]);
								});
							});
						}

						setTimeout(function(){
							displayList();
							// alert('trainee_workout');
						},1000);
					}else{
						showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncWorkout() {
	var trainee_id = window.localStorage.getItem("userlogin");
	var trainer_id = window.localStorage.getItem("trainer_id");
	var s='';

	var curentDate = new Date();
	var curentMonth = curentDate.getMonth() + 1;

	if(curentMonth <= 9)
		curentMonth = "0"+curentMonth;

	var firstq = date("Y-m-%", get_timestamp());
	var secondq = date("Y-m-%", strtotime("+1 month"));
	var thirdq = date("Y-m-%", strtotime("-1 month"));

	var sqlite = "SELECT * FROM `workout` WHERE trainer_id = ? AND ( (`date` LIKE '"+firstq+"') OR (`date` LIKE '"+secondq+"') OR (`date` LIKE '"+thirdq+"') ) ";
	
	db.transaction(function(tx) {
		tx.executeSql(sqlite, [trainer_id], function(tx, results) {
	
			var syncData = [];
			s = '';
			for(var i=0; i<results.rows.length; i++) {
				s = '';
				s += results.rows.item(i).id;
				s += '_--_'+results.rows.item(i).notes;
				s += '_--_'+results.rows.item(i).trainer_id;
				s += '_--_'+results.rows.item(i).trainee_id;
				s += '_--_'+results.rows.item(i).date;
				s += '_--_'+results.rows.item(i).time;
				s += '_--_'+results.rows.item(i).name;
				s += '_--_'+results.rows.item(i).description;
				s += '_--_'+results.rows.item(i).image;
				s += '_--_'+results.rows.item(i).status;
				s += '_--_'+results.rows.item(i).created;
				s += '_--_'+results.rows.item(i).updated;
				s += '_--_'+results.rows.item(i).token;
				s += '_--_'+results.rows.item(i).lastupdated;
				s += '_--_'+results.rows.item(i).anytime;
				s += '_--_'+results.rows.item(i).type;
				s += '_--_'+results.rows.item(i).circuit_name;
				s += '_--_'+results.rows.item(i).circuit_description;
				s += '_--_'+results.rows.item(i).circuit_image;
				syncData.push(s);
			}

			var syncData = syncData.join('__----__');

			$.ajax({
				method : 'POST',
      			url : apiUrl,
				data : { 'method' : 'sync_workout' , 'trainee_id' : trainee_id , 'trainer_id' : trainer_id , 'syncData' : syncData },
				type : 'POST',
				beforeSend : function(){
					var td_send = $("#table_data_send").val();
					if(td_send == 'SEND'){
						$("#table_data_send").val('0');
					}else{
						td_send = parseInt(td_send);
						$("#table_data_send").val(parseInt( td_send + 1));
					}
				},
				error : function(){
					syncEnd();
				},
				success : function(resp){

					res = JSON.parse(resp);

					if(res.success){
						var response = res.success.data;
						if(response){	
							$.each(response, function(index, ob){
								// alert(ob.token);
								db.transaction(function(ctx) {
									ctx.executeSql("delete from workout where id = ?", [ob.id], function(ctx) {
										// db.transaction(function(ptx) {
											ctx.executeSql("insert into workout(id,notes, trainer_id, trainee_id, date, time, name, description, image, base64image, status, created, updated, token, lastupdated, anytime, type, circuit_name, circuit_description, circuit_image) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [ob.id, ob.notes, ob.trainer_id, ob.trainee_id, ob.date, ob.time, ob.name, ob.description, ob.image, ob.base64image, ob.status, ob.created, ob.updated, ob.token, ob.lastupdated, ob.anytime, ob.type, ob.circuit_name, ob.circuit_description, ob.circuit_image]);
											
											var id = ob.id;
											// var image = './assets/uploads/workout/'+ob.image;
											var image = ob.image;
											var tablename = 'workout';
											insertBase64Image(id, image, tablename);

											/*
											if( (ob.circuit_image != '') && (ob.type == '2' || ob.type == '2.0') ){
												insertCBase64Image(id, ob.circuit_image, tablename, 'cbase64image');
											}
											*/

										// },dbError);
									});
								},dbError);
							});
						}

						if(res.success.delete_ids){
							$.each(res.success.delete_ids, function(i,v){
								db.transaction(function(ctx) {
									ctx.executeSql("DELETE FROM workout where id = ?", [v]);
								});
							});
						}
						
						setTimeout(function(){
							displayList();
							// alert('workout');
						},1000);
					}else{
						showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncExercise() {
	var trainer_id = window.localStorage.getItem("trainer_id");
	var s;
	var curentDate = new Date();
	var curentMonth = curentDate.getMonth() + 1;

	if(curentMonth <= 9)
		curentMonth = "0"+curentMonth;

	var firstq = date("Y-m-%", get_timestamp());
	var secondq = date("Y-m-%", strtotime("+1 month"));
	var thirdq = date("Y-m-%", strtotime("-1 month"));

	var sqlite = "SELECT * FROM `workout` WHERE trainer_id = ? AND ( (`date` LIKE '"+firstq+"') OR (`date` LIKE '"+secondq+"') OR (`date` LIKE '"+thirdq+"') ) ";
	
	db.transaction(function(tx) {
		tx.executeSql(sqlite, [trainer_id], function(tx, results) {
			var workout_ids = [];
			for(var i=0; i<results.rows.length; i++) {
				s = results.rows.item(i).id;
				workout_ids.push(' workout_id = ' + s + ' ');
			}

			var where = '';

			if(workout_ids.length > 0){
				where = workout_ids.join(' OR ');
			}

			if(where != ''){
				where = 'where '+where;
			}

			where = '';

			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise "+where, [], function(ctx, results) {
			
					var syncData = [];
					s = '';
					for(var i=0; i<results.rows.length; i++) {
						s = '';
						s += results.rows.item(i).id;
						s += '_--_'+results.rows.item(i).notes;
						s += '_--_'+results.rows.item(i).workout_id;
						s += '_--_'+results.rows.item(i).name;
						s += '_--_'+results.rows.item(i).description;
						s += '_--_'+results.rows.item(i).timetaken;
						s += '_--_'+results.rows.item(i).resttime;
						s += '_--_'+results.rows.item(i).image;
						s += '_--_'+results.rows.item(i).status;
						s += '_--_'+results.rows.item(i).created;
						s += '_--_'+results.rows.item(i).updated;
						s += '_--_'+results.rows.item(i).token;
						s += '_--_'+results.rows.item(i).lastupdated;
						s += '_--_'+results.rows.item(i).circuit_id;
						syncData.push(s);

						// alert(results.rows.item(i).circuit_id);
					}

					var syncData = syncData.join('__----__');

					$.ajax({
						method : 'POST',
		      			url : apiUrl,
						data : { 'method' : 'sync_exercise' , 'trainer_id' : trainer_id , 'syncData' : syncData },
						type : 'POST',
						beforeSend : function(){
							var td_send = $("#table_data_send").val();
							if(td_send == 'SEND'){
								$("#table_data_send").val('0');
							}else{
								td_send = parseInt(td_send);
								$("#table_data_send").val(parseInt( td_send + 1));
							}
						},
						error : function(){
							syncEnd();
						},
						success : function(resp){

							// alert(resp);

							res = JSON.parse(resp);

							if(res.success){
								var response = res.success.data;
								if(response){	
									$.each(response, function(index, ob){
										// alert(ob.circuit_id);
										db.transaction(function(ctx) {
											ctx.executeSql("delete from exercise where id = ?", [ob.id], function(ctx) {
												// db.transaction(function(ptx) {
													ctx.executeSql("insert into exercise(id, notes, workout_id, name, description, timetaken, resttime, image, base64image, status, created, updated, lastupdated, token, circuit_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [ob.id, ob.notes, ob.workout_id, ob.name, ob.description, ob.timetaken, ob.resttime, ob.image, ob.base64image, ob.status, ob.created, ob.updated, ob.lastupdated, ob.token, ob.circuit_id]);
													
													var id = ob.id;
													// var image = './assets/uploads/exercise/'+ob.image;
													var image = ob.image;
													var tablename = 'exercise';
													insertBase64Image(id, image, tablename);

												// },dbError);
											});
										},dbError);
									});
								}

								if(res.success.delete_ids){
									$.each(res.success.delete_ids, function(i,v){
										db.transaction(function(ctx) {
											ctx.executeSql("DELETE FROM exercise where id = ?", [v]);
										});
									});
								}

								setTimeout(function(){
									displayList();
									// alert('exercise');
								},1000);
							}else{
								showAlert(res.error);
							}
						}
					});
				})
			},dbError);

		})
	},dbError);
}

function syncCircuit() {
	var trainer_id = window.localStorage.getItem("trainer_id");
	var s;
	var curentDate = new Date();
	var curentMonth = curentDate.getMonth() + 1;

	if(curentMonth <= 9)
		curentMonth = "0"+curentMonth;

	var firstq = date("Y-m-%", get_timestamp());
	var secondq = date("Y-m-%", strtotime("+1 month"));
	var thirdq = date("Y-m-%", strtotime("-1 month"));

	var sqlite = "SELECT * FROM `workout` WHERE trainer_id = ? AND ( (`date` LIKE '"+firstq+"') OR (`date` LIKE '"+secondq+"') OR (`date` LIKE '"+thirdq+"') ) ";
	
	db.transaction(function(tx) {
		tx.executeSql(sqlite, [trainer_id], function(tx, results) {
			var workout_ids = [];
			for(var i=0; i<results.rows.length; i++) {
				s = results.rows.item(i).id;
				workout_ids.push(' workout_id = ' + s + ' ');
			}

			var where = '';

			if(workout_ids.length > 0){
				where = workout_ids.join(' OR ');
			}

			if(where != ''){
				where = 'where '+where;
			}

			where = '';

			db.transaction(function(ctx) {
				ctx.executeSql("select * from circuit "+where, [], function(ctx, results) {
			
					var syncData = [];
					s = '';
					for(var i=0; i<results.rows.length; i++) {
						s = '';
						s += results.rows.item(i).id;
						s += '_--_'+results.rows.item(i).workout_id;
						s += '_--_'+results.rows.item(i).name;
						s += '_--_'+results.rows.item(i).description;
						s += '_--_'+results.rows.item(i).image;
						s += '_--_'+results.rows.item(i).created;
						s += '_--_'+results.rows.item(i).updated;
						s += '_--_'+results.rows.item(i).token;
						s += '_--_'+results.rows.item(i).lastupdated;
						syncData.push(s);
					}

					var syncData = syncData.join('__----__');

					$.ajax({
						method : 'POST',
		      			url : apiUrl,
						data : { 'method' : 'sync_circuit' , 'trainer_id' : trainer_id , 'syncData' : syncData },
						type : 'POST',
						beforeSend : function(){
							var td_send = $("#table_data_send").val();
							if(td_send == 'SEND'){
								$("#table_data_send").val('0');
							}else{
								td_send = parseInt(td_send);
								$("#table_data_send").val(parseInt( td_send + 1));
							}
						},
						error : function(){
							syncEnd();
						},
						success : function(resp){

							res = JSON.parse(resp);

							if(res.success){
								var response = res.success.data;
								if(response){	
									$.each(response, function(index, ob){
										// alert(ob.token);
										db.transaction(function(ctx) {
											ctx.executeSql("delete from circuit where id = ?", [ob.id], function(ctx) {
												// db.transaction(function(ptx) {
													ctx.executeSql("insert into circuit(id, workout_id, name, description, image, base64image, created, updated, lastupdated, token) values(?,?,?,?,?,?,?,?,?,?)", [ob.id, ob.workout_id, ob.name, ob.description, ob.image, ob.base64image, ob.created, ob.updated, ob.lastupdated, ob.token]);
													
													var id = ob.id;
													// var image = './assets/uploads/exercise/'+ob.image;
													var image = ob.image;
													var tablename = 'circuit';
													insertBase64Image(id, image, tablename);

												// },dbError);
											});
										},dbError);
									});
								}

								if(res.success.delete_ids){
									$.each(res.success.delete_ids, function(i,v){
										db.transaction(function(ctx) {
											ctx.executeSql("DELETE FROM circuit where id = ?", [v]);
										});
									});
								}

								setTimeout(function(){
									displayList();
									// alert('exercise');
								},1000);
							}else{
								showAlert(res.error);
							}
						}
					});
				})
			},dbError);

		})
	},dbError);
}

function syncExerciseSet() {
	var trainer_id = window.localStorage.getItem("trainer_id");
	var s;
	var curentDate = new Date();
	var curentMonth = curentDate.getMonth() + 1;

	if(curentMonth <= 9)
		curentMonth = "0"+curentMonth;

	var firstq = date("Y-m-%", get_timestamp());
	var secondq = date("Y-m-%", strtotime("+1 month"));
	var thirdq = date("Y-m-%", strtotime("-1 month"));

	var sqlite = "SELECT * FROM `workout` WHERE trainer_id = ? AND ( (`date` LIKE '"+firstq+"') OR (`date` LIKE '"+secondq+"') OR (`date` LIKE '"+thirdq+"') ) ";
	
	db.transaction(function(tx) {
		tx.executeSql(sqlite, [trainer_id], function(tx, results) {
			var workout_ids = [];
			for(var i=0; i<results.rows.length; i++) {
				s = results.rows.item(i).id;
				workout_ids.push(' workout_id = ' + s + ' ');
			}

			var where = '';

			if(workout_ids.length > 0){
				where = workout_ids.join(' OR ');
			}

			if(where != ''){
				where = 'where '+where;
			}

			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise "+where, [], function(ctx, results) {
					
					var exercise_ids = [];
					for(var i=0; i<results.rows.length; i++) {
						s = results.rows.item(i).id;
						exercise_ids.push(' exercise_id = ' + s + ' ');
					}

					var where2 = '';

					if(exercise_ids.length > 0){
						where2 = exercise_ids.join(' OR ');
					}

					if(where2 != ''){
						where2 = 'where '+where2;
					}

					db.transaction(function(ptx) {
					ptx.executeSql("select * from exercise_set "+where2, [], function(ptx, results) {
				
						var syncData = [];
						s = '';
						for(var i=0; i<results.rows.length; i++) {
							s = '';
							s += results.rows.item(i).id;
							s += '_--_'+results.rows.item(i).exercise_id;
							s += '_--_'+results.rows.item(i).value;
							s += '_--_'+results.rows.item(i).reps;
							s += '_--_'+results.rows.item(i).resultweight;
							s += '_--_'+results.rows.item(i).timetaken;
							s += '_--_'+results.rows.item(i).resultreps;
							s += '_--_'+results.rows.item(i).set_status;
							s += '_--_'+results.rows.item(i).created;
							s += '_--_'+results.rows.item(i).updated;
							s += '_--_'+results.rows.item(i).token;
							s += '_--_'+results.rows.item(i).time;
							s += '_--_'+results.rows.item(i).lastupdated;
							syncData.push(s);
						}

						var syncData = syncData.join('__----__');

						$.ajax({
							method : 'POST',
			      			url : apiUrl,
							data : { 'method' : 'sync_exercise_set' , 'trainer_id' : trainer_id , 'syncData' : syncData },
							type : 'POST',
							beforeSend : function(){
								var td_send = $("#table_data_send").val();
								if(td_send == 'SEND'){
									$("#table_data_send").val('0');
								}else{
									td_send = parseInt(td_send);
									$("#table_data_send").val(parseInt( td_send + 1));
								}
							},
							error : function(){
								syncEnd();
							},
							success : function(resp){

								res = JSON.parse(resp);

								if(res.success){
									var response = res.success.data;
									if(response){	
										$.each(response, function(index, ob){
											// alert(ob.token);
											db.transaction(function(ctx) {
												ctx.executeSql("delete from exercise_set where id = ?", [ob.id], function(ctx) {
													// db.transaction(function(ptx) {
														ctx.executeSql("insert into exercise_set(id, exercise_id, value, reps, resultweight, timetaken, resultreps, set_status, created, updated, time, lastupdated, token) values(?,?,?,?,?,?,?,?,?,?,?,?,?)", [ob.id, ob.exercise_id, ob.value, ob.reps, ob.resultweight, ob.timetaken, ob.resultreps, ob.set_status, ob.created, ob.updated, ob.time, ob.lastupdated, ob.token]);
													// },dbError);
												});
											},dbError);
										});
									}

									if(res.success.delete_ids){
										$.each(res.success.delete_ids, function(i,v){
											db.transaction(function(ctx) {
												ctx.executeSql("DELETE FROM exercise_set where id = ?", [v]);
											});
										});
									}

									setTimeout(function(){
										displayList();
										// alert('exercise_set');
									},1000);
								}else{
									showAlert(res.error);
								}
							}
						});
					})
				},dbError);

				})
			},dbError);

		})
	},dbError);
}

function displayList() {

	var td_get = $("#table_data_get").val();

	if(td_get == 'GET'){
		$("#table_data_get").val('0');
	}else{
		td_get = parseInt(td_get);
		$("#table_data_get").val(parseInt( td_get + 1));
	}

	var check_send = $("#request_send").val();
	var check_get = $("#request_get").val();

	var check_table_data_send = parseInt($("#table_data_send").val());
	var check_table_data_get = parseInt($("#table_data_get").val());

	// var t = 'check_send -> ' + check_send + '\n';
	// t += 'check_get -> ' + check_get + '\n';
	// t += 'check_table_data_send -> ' + check_table_data_send + '\n';
	// t += 'check_table_data_get -> ' + check_table_data_get + '\n';
	// alert(t);

	if(check_table_data_send == check_table_data_get){
		$("#syncPercent2").html('Loading Data : 100%');
		if(check_send == 'SEND' && check_get == 'GET')
			syncEnd();
	}
	else{
		var completed;
		completed = parseInt((check_table_data_get / check_table_data_send) * 100);

		if(completed != 'NaN')
			$("#syncPercent2").html('Loading Data : '+completed+'%');
	}

	// var userid = window.localStorage.getItem("userlogin");
	// db.transaction(function(tx) {
	// 	tx.executeSql("select * from trainee_workout where trainee_id = ?", [userid], function(tx, results) {
	// 		for(var i=0; i<results.rows.length; i++) {
	// 			document.write(results.rows.item(i).id+' - '+results.rows.item(i).trainee_id+' - '+results.rows.item(i).workout_id+' - '+results.rows.item(i).is_group+' - '+results.rows.item(i).group_id+' - '+results.rows.item(i).created+' - '+results.rows.item(i).updated+' - '+results.rows.item(i).token+' - '+results.rows.item(i).lastupdated+'<br>------------------<br>');
	// 		}
	// 	})
	// },dbError);

	// var userid = window.localStorage.getItem("userlogin");
	// db.transaction(function(tx) {
	// 	tx.executeSql("select * from workout", [], function(tx, results) {
	// 		for(var i=0; i<results.rows.length; i++) {
	// 			document.write(results.rows.item(i).id+'<br>-------<br>');
	// 		}
	// 	})
	// },dbError);
}

function displayAll(){

	$('#caltasks').html('');

	/*
	db.transaction(function(tx) {
		tx.executeSql("select * from workout_notes", [], function(tx, results) {
			var workout_notes = '';
			workout_notes += '<h1>workout_notes</h1>';
			workout_notes += '<table>';
			for(var i=0; i<results.rows.length; i++) {
				workout_notes += '<tr>';
				workout_notes += '<td>';
				workout_notes += results.rows.item(i).id;
				workout_notes += ' - ';
				workout_notes += results.rows.item(i).workout_id;
				workout_notes += ' - ';
				workout_notes += results.rows.item(i).trainee_id;
				workout_notes += ' - ';
				workout_notes += results.rows.item(i).notes;
				workout_notes += '</td>';
				workout_notes += '</tr>';
			}
			workout_notes += '<table>';
			workout_notes += '<h1>&nbsp;</h1>';
			$("#caltasks").append(workout_notes);
		})
	},dbError);

	db.transaction(function(tx) {
		tx.executeSql("select * from exercise_notes", [], function(tx, results) {
			var exercise_notes = '';
			exercise_notes += '<h1>exercise_notes</h1>';
			exercise_notes += '<table>';
			for(var i=0; i<results.rows.length; i++) {
				exercise_notes += '<tr>';
				exercise_notes += '<td>';
				exercise_notes += results.rows.item(i).id;
				exercise_notes += ' - ';
				exercise_notes += results.rows.item(i).exercise_id;
				exercise_notes += ' - ';
				exercise_notes += results.rows.item(i).trainee_id;
				exercise_notes += ' - ';
				exercise_notes += results.rows.item(i).notes;
				exercise_notes += '</td>';
				exercise_notes += '</tr>';
			}
			exercise_notes += '<table>';
			exercise_notes += '<h1>&nbsp;</h1>';
			$("#caltasks").append(exercise_notes);
		})
	},dbError);

	db.transaction(function(tx) {
		tx.executeSql("select * from exercise_set_results", [], function(tx, results) {
			var exercise_set_results = '';
			exercise_set_results += '<h1>exercise_set_results</h1>';
			exercise_set_results += '<table>';
			for(var i=0; i<results.rows.length; i++) {
				exercise_set_results += '<tr>';
				exercise_set_results += '<td>';
				exercise_set_results += results.rows.item(i).id;
				exercise_set_results += ' - ';
				exercise_set_results += results.rows.item(i).exercise_set_id;
				exercise_set_results += ' - ';
				exercise_set_results += results.rows.item(i).trainee_id;
				exercise_set_results += ' - ';
				exercise_set_results += results.rows.item(i).resultweight;
				exercise_set_results += ' - ';
				exercise_set_results += results.rows.item(i).resultreps;
				exercise_set_results += '</td>';
				exercise_set_results += '</tr>';
			}
			exercise_set_results += '<table>';
			exercise_set_results += '<h1>&nbsp;</h1>';
			$("#caltasks").append(exercise_set_results);
		})
	},dbError);
	
	

	$("body").html('');

	*/
	var userid = window.localStorage.getItem("userlogin");

	/*
	db.transaction(function(tx) {
		tx.executeSql("select * from conversation", [], function(tx, results) {
			var conversation = '';
			conversation += '<h1>conversation</h1>';
			conversation += '<table>';
			for(var i=0; i<results.rows.length; i++) {
				conversation += '<tr>';
				conversation += '<td>';
				conversation += results.rows.item(i).id;
				conversation += '</td>';
				conversation += '</tr>';
			}
			conversation += '<table>';
			conversation += '<h1>&nbsp;</h1>';
			$("body").append(conversation);
		})
	},dbError);
	*/

	db.transaction(function(tx) {
		tx.executeSql("select * from exercise", [], function(tx, results) {
			var exercise = '';
			exercise += '<h1>exercise</h1>';
			exercise += '<table>';
			for(var i=0; i<results.rows.length; i++) {
				exercise += '<tr>';
				exercise += '<td>';
				exercise += results.rows.item(i).id;
				exercise += '</td>';
				exercise += '<td>';
				exercise += '<img src="';
				exercise += results.rows.item(i).base64image;
				exercise += '" width="100">';
				exercise += '</td>';
				exercise += '<td>';
				exercise += '<img src="'+bucket_path;
				exercise += results.rows.item(i).image;
				exercise += '" width="100">';
				exercise += '</td>';
				exercise += '<td>---';
				exercise += results.rows.item(i).image;
				exercise += '---</td>';
				exercise += '</tr>';
			}
			exercise += '<table>';
			exercise += '<h1>&nbsp;</h1>';
			$("#caltasks").append(exercise);
		})
	},dbError);

	table = 'exercise_set';
	db.transaction(function(tx) {
		tx.executeSql("select * from exercise_set", [], function(tx, results) {
			var exercise_set = '';
			exercise_set += '<h1>exercise_set</h1>';
			exercise_set += '<table>';
			for(var i=0; i<results.rows.length; i++) {
				exercise_set += '<tr>';
				exercise_set += '<td>';
				exercise_set += results.rows.item(i).id;
				exercise_set += '</td>';
				exercise_set += '</tr>';
			}
			exercise_set += '<table>';
			exercise_set += '<h1>&nbsp;</h1>';
			$("#caltasks").append(exercise_set);
		})
	},dbError);

	/*
	db.transaction(function(tx) {
		tx.executeSql("select * from support", [], function(tx, results) {
			var support = '';
			support += '<h1>support</h1>';
			support += '<table>';
			for(var i=0; i<results.rows.length; i++) {
				support += '<tr>';
				support += '<td>';
				support += results.rows.item(i).id;
				support += '</td>';
				support += '</tr>';
			}
			support += '<table>';
			support += '<h1>&nbsp;</h1>';
			$("body").append(support);
		})
	},dbError);

	db.transaction(function(tx) {
		tx.executeSql("select * from trainee", [], function(tx, results) {
			var trainee = '';
			trainee += '<h1>trainee</h1>';
			trainee += '<table>';
			for(var i=0; i<results.rows.length; i++) {
				trainee += '<tr>';
				trainee += '<td>';
				trainee += results.rows.item(i).id;
				trainee += '</td>';
				trainee += '<td>';
				trainee += '<img src="';
				trainee += results.rows.item(i).base64image;
				trainee += '" width="100">';
				trainee += '</td>';
				trainee += '<td>';
				trainee += '<img src="'+bucket_path;
				trainee += results.rows.item(i).image;
				trainee += '" width="100">';
				trainee += '</td>';
				trainee += '<td>---';
				trainee += results.rows.item(i).image;
				trainee += '---</td>';
				trainee += '</tr>';
			}
			trainee += '<table>';
			trainee += '<h1>&nbsp;</h1>';
			$("body").append(trainee);
		})
	},dbError);
	*/

	db.transaction(function(tx) {
		tx.executeSql("select * from trainee_workout", [], function(tx, results) {
			var trainee_workout = '';
			trainee_workout += '<h1>trainee_workout</h1>';
			trainee_workout += '<table>';
			for(var i=0; i<results.rows.length; i++) {
				trainee_workout += '<tr>';
				trainee_workout += '<td>';
				trainee_workout += results.rows.item(i).id;
				trainee_workout += '</td>';
				trainee_workout += '</tr>';
			}
			trainee_workout += '<table>';
			trainee_workout += '<h1>&nbsp;</h1>';
			$("#caltasks").append(trainee_workout);
		})
	},dbError);

	// db.transaction(function(tx) {
	// 	tx.executeSql("select * from trainer", [], function(tx, results) {
	// 		var trainer = '';
	// 		trainer += '<h1>trainer</h1>';
	// 		trainer += '<table>';
	// 		for(var i=0; i<results.rows.length; i++) {
	// 			trainer += '<tr>';
	// 			trainer += '<td>';
	// 			trainer += results.rows.item(i).id;
	// 			trainer += '</td>';
	// 			trainer += '</tr>';
	// 		}
	// 		trainer += '<table>';
	// 		trainer += '<h1>&nbsp;</h1>';
	// 		$("body").append(trainer);
	// 	})
	// },dbError);

	db.transaction(function(tx) {
		tx.executeSql("select * from workout", [], function(tx, results) {
			var workout = '';
			workout += '<h1>workout</h1>';
			workout += '<table>';
			for(var i=0; i<results.rows.length; i++) {
				workout += '<tr>';
				workout += '<td>';
				workout += results.rows.item(i).id;
				workout += '</td>';
				workout += '<td>';
				workout += '<img src="';
				workout += results.rows.item(i).base64image;
				workout += '" width="100">';
				workout += '</td>';
				workout += '<td>';
				workout += '<img src="'+bucket_path;
				workout += results.rows.item(i).image;
				workout += '" width="100">';
				workout += '</td>';
				workout += '<td>';
				workout += results.rows.item(i).name;
				workout += '</td>';
				workout += '</tr>';
			}
			workout += '<table>';
			workout += '<h1>&nbsp;</h1>';
			$("#caltasks").append(workout);
		})
	},dbError);
}

function insertCBase64Image(id, image, tablename, fieldname){
	var send = $("#request_send").val();
	if(send == 'SEND'){
		$("#request_send").val('0');
	}else{
		send = parseInt(send);
		$("#request_send").val(parseInt( send + 1));
	}

	$.ajax({
		url : apiImageConvertUrl,
		type : 'POST',
		data : { 'image' : image },
		success : function(resp){
			if(resp.base64image){
				db.transaction(function(utx) {
					utx.executeSql("update "+tablename+" set "+fieldname+" = ? where id = ?", [resp.base64image, id], function(){
						var get = $("#request_get").val();
						if(get == 'GET'){
							$("#request_get").val('0');
						}else{
							get = parseInt(get);
							$("#request_get").val(parseInt( get + 1));
						}
						var check_send = parseInt($("#request_send").val());
						var check_get = parseInt($("#request_get").val());
						if(check_send == check_get){
							$("#syncPercent").html('Loading Images : 100%');
							var check_table_data_send = parseInt($("#table_data_send").val());
							var check_table_data_get = parseInt($("#table_data_get").val());
							if(check_table_data_send == check_table_data_get){
								syncEnd();
							}
						}
						else{
							var completed;
							completed = parseInt((check_get / check_send) * 100);
							if(completed != 'NaN')
								$("#syncPercent").html('Loading Images : '+completed+'%');
						}
					});
				},dbError);
			}
		}
	});
}

function insertBase64Image(id, image, tablename){
	// alert('ID --> '+id);
	// alert('IMAGE --> '+image);
	// alert('TABLE --> '+tablename);
	// alert('URL --> '+apiImageConvertUrl);

	var send = $("#request_send").val();

	if(send == 'SEND'){
		$("#request_send").val('0');
	}else{
		send = parseInt(send);
		$("#request_send").val(parseInt( send + 1));
	}

	$.ajax({
		url : apiImageConvertUrl,
		type : 'POST',
		data : { 'image' : image },
		success : function(resp){
			if(resp.base64image){
				db.transaction(function(utx) {
					utx.executeSql("update "+tablename+" set base64image = ? where id = ?", [resp.base64image, id], function(){
						var get = $("#request_get").val();

						if(get == 'GET'){
							$("#request_get").val('0');
						}else{
							get = parseInt(get);
							$("#request_get").val(parseInt( get + 1));
						}

						var check_send = parseInt($("#request_send").val());
						var check_get = parseInt($("#request_get").val());

						if(check_send == check_get){
							$("#syncPercent").html('Loading Images : 100%');
							
							var check_table_data_send = parseInt($("#table_data_send").val());
							var check_table_data_get = parseInt($("#table_data_get").val());
							if(check_table_data_send == check_table_data_get){
								syncEnd();
							}
						}
						else{
							var completed;
							completed = parseInt((check_get / check_send) * 100);

							if(completed != 'NaN')
								$("#syncPercent").html('Loading Images : '+completed+'%');
						}

					});
				},dbError);
			}
		}
	});
}

function db_setWorkout(){
	var trainee_id =  window.localStorage.getItem('userlogin');

	var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var d = new Date();          
	var dat = monthNames[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();

	var today_date = d.getFullYear() + '-' + parseInt(d.getMonth()+1) + '-' + d.getDate();

	var sqlite = 'SELECT `w`.*, `tw`.`trainee_id` FROM (`workout` as w) JOIN `trainee_workout` as tw ON `tw`.`workout_id` = `w`.`id` WHERE `tw`.`trainee_id` = "'+trainee_id+'" ORDER BY `w`.`date` asc';

	db.transaction(function(tx) {
		tx.executeSql(sqlite, [], function(tx, results) {
			if(results.rows.length == 0){
				set_blank_homepage();
				return 0;
			}
			
			var workout = [];
			for(var ii=0;ii < results.rows.length; ii++) {
				if(date('Y-m-d') == results.rows.item(ii).date){
					workout.push(results.rows.item(ii));
					/*
					if(date('H:i:s') <= results.rows.item(ii).time){
	 					workout = results.rows.item(ii); 	 				
	 				}
	 				else{
	 					// alert('Time ==> '+results.rows.item(i).time);
	 				}
	 				*/
				}
				else{
					// alert('DATE ==> '+results.rows.item(i).date);
 				}
			}

			if(workout.length > 0 ){
				
				if(workout.length > 1 ){
					
					$("#appendexercises, .imagin").remove();

					// $(".imagin").html('');

					var ht = '';

					$.each(workout, function(i,v){
						var workoutdate = date("M d,Y", strtotime(v.date));
						var workouttime = date("h:i A", strtotime(v.time));
						
						if(v.type == 3 || v.type == '3' || v.type == '3.0')
							var methodname = 'db_getNewCircuitWorkoutById';
						else if(v.type == 2 || v.type == '2' || v.type == '2.0')
							var methodname = 'db_getCircuitWorkout_byid';
						else
							var methodname = 'db_getWorkout_byid';

						// ht += '<a href="#" onclick="getWorkout_byid('+ "'" + v.id + "'" +')" style="color:#fff; text-decoration:none;">'
						ht += '<a href="#" onclick="'+methodname+'('+ "'" + v.id + "'" +')" style="color:#fff; text-decoration:none;">'
						
						ht += '<span style="font-size:16px;">';
						ht += v.name;
						ht += '</span>';
						
						ht += '<br>'

						ht += '<span style="color:#0091AE">';
						
						if(parseInt(v.anytime) != 1 )
							ht += workouttime;
						else
							ht += 'Anytime';
						
						ht += '</span>';
						ht += '</a>';
						
						ht += '<br>';
						ht += '<br>';

					});

					// alert(ht);

					$("#wdescription").html(ht);

					$("#wdescription").css('padding-top', '50px');
					$("#wdescription").css('text-align', 'center');

					return 0;
				}
				else{
					workout = workout[0];
					if(workout.type == 3 || workout.type == '3' || workout.type == '3.0')
						db_getNewCircuitWorkoutById(workout.id);
					else if(workout.type == 2 || workout.type == '2' || workout.type == '2.0')
						db_getCircuitWorkout_byid(workout.id);
					else
						db_getWorkout_byid(workout.id);
					
					return 0;
				}

				showLoader();
				setTimeout(function(){
					var workoutdate = date("M d,Y", strtotime(workout.date));
					var workouttime = date("h:i", strtotime(workout.time));

					var wTime = strtotime ( workout.date + ' ' + workout.time );
					var tTime = get_timestamp();

					wTime = parseInt(wTime) + parseInt( 86400 ); // one day seconds = 86400

					if(wTime < tTime){
						var updateAbility = false;
					}
					else{
						var updateAbility = true;
					}
					
					$('#noworkoutbtn').hide();
					db_update_workoutstatus(workout.id);
					
					if(workout.base64image != '' && workout.base64image != '0'){
						$('#workoutimage').attr('src', workout.base64image);
						$('#workoutimage')
							.load(function(){
								// alert('Image is loaded');
							})
							.error(function(){
								// alert('Image is not loaded');
								$('#workoutimage').remove();
								$('#wdescription').css('padding-top', '50px');
							});
					}
					else{
						// $('#workoutimage').attr('src', no_image);
						$('#workoutimage').remove();
						$('#wdescription').css('padding-top', '50px');
					}
					
					$('#timeval').html(workouttime);
					$('#wnamedate').html(workout.name+' <span>'+workoutdate+'</span>');
	        		$('#wdescription').html(workout.description);
	        		
	        		

			        // sqlite = 'SELECT * FROM exercise where workout_id = '+workout.id;

			        sqlite = 'SELECT `e`.`id`, `e`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `en`.`id` as status, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated` FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` WHERE `e`.`workout_id` = '+workout.id;

			        // alert(sqlite);

			        db.transaction(function(ctx) {
						ctx.executeSql(sqlite, [], function(ctx, exercise_results) {
							var i = 1;
					        var j = 1;
					        var content = "";
					        var ids="";
					        var k = 1;

					        var ids_arr = [];
					        var exercise;
					        var clos;

							var flag = 0;
							for(var iii=0;iii < exercise_results.rows.length; iii++) {
								exercise = exercise_results.rows.item(iii);
								ids_arr.push(exercise.id);
							}

							ids = ids_arr.join(',');

							// alert(ids);
							content +='<ons-row class="row ons-row-inner" >';
							for(var iii=0;iii < exercise_results.rows.length; iii++) {
								exercise = exercise_results.rows.item(iii);
								
								if(updateAbility){
									if(flag==0){ // && exercise.status != null
						              $('#workoutbtn').attr('onclick','return exerciseDetails('+exercise.id+', \''+ids+'\')')
						              flag=1;
						            }
								}
								else{
									if(flag==0){
						              $('#workoutbtn').html('View Workout');
						              $('#workoutbtn').attr('onclick','return oldExerciseDetails('+exercise.id+', \''+ids+'\')')
						              flag=1;
						            }
								}

								/*
								if(!updateAbility){
									$('ons-tabbar').remove();
								}

								if(flag==0 && exercise.status == 0){
					              if(updateAbility){	
					              	$('#workoutbtn').attr('onclick','return exerciseDetails('+exercise.id+', \''+ids+'\')')
					              }
					              else{
					              	$('ons-tabbar').remove();
					              }

					              flag=1;
					            }
					            */

								
								clos = '';
					            
					            /*
					            if(exercise.status == 1){
					              var clos = 'closed';
					            }
					            */

					            if(exercise.status != null){
					              var clos = 'closed';
					            }
					            	
					            if(updateAbility)
									content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return exerciseDetails('+exercise.id+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+exercise.name+'</a></ons-col>';
								else
									content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return oldExerciseDetails('+exercise.id+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+exercise.name+'</a></ons-col>';

					            if(i%2 == 0){
					              content +='</ons-row>';
					              content +='<ons-row class="row ons-row-inner" >';
					            }

					            i++;
	            				j++;

							}

							content +='</ons-row>'; 

							$('#appendexercises').append(content); 

							$('#workoutbtn').show();

						})
					},dbError);
					hideLoader();
				},800);
			}
			else{
				set_blank_homepage();
				return 0;
			}

		})
	},dbError);
}

function db_update_workoutstatus(workoutid){
	var exercise;
	var sqlite = 'SELECT * FROM exercise where workout_id = '+workoutid;
	db.transaction(function(ctx) {
		ctx.executeSql(sqlite, [], function(ctx, exercise_results) {
			var flagg = 1;
			for(var uws=0;uws < exercise_results.rows.length; uws++) {
				var exercise = exercise_results.rows.item(uws);
				
				if(exercise.status != '1.0' && exercise.status != '1' ){
					flagg = 0;
				}
			}

			if(flagg == 1){
				var lastupdated = get_timestamp();
				db.transaction(function(utx) {
					utx.executeSql("update workout set status = ? , lastupdated = ? where id = ?", [1, lastupdated, workoutid]);
					
					if(isOnline()){
						$.ajax({
							type:'POST',
							url : apiUrl, 
							data: {
								'id' : workoutid,
								'lastupdated' : lastupdated,
								'method' : 'db_update_workoutstatus'
							}    
						});
					}
				},dbError);
			}
		})
	},dbError);	
}

function set_blank_homepage(){
	var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var d = new Date();          
	var dat = monthNames[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
	
	$('#workoutimage').attr('src', 'images/img1.jpg');

	$('#wnamedate').html(dat);          
	$('#wnamedate').css('text-align','right');          
	$('#wdescription').html('No Scheduled Workout <br> For Today');
	$('#wdescription').css({'text-align':'center','font-size':'20px','margin-top':'40px'});
	$('#noworkoutbtn').show();
}

function db_exerciseDetailsFuture(id, ids){
	showLoader();
	setTimeout(function(){
		ids = ids.split(',');    
		for (var i = 0; i <= ids.length; i++) {                          
			if(id == ids[i]){
				if(ids[parseInt(i+1)]){        
					var nextid  = ids[parseInt(i+1)];
					nxtlink = "db_exerciseDetailsFuture("+nextid+",'"+ids+"')";
					// break;
				}else{
					nxtlink=false;
				}

				if(ids[parseInt(i-1)]){        
					var backid  = ids[parseInt(i-1)];
					var backlink = "db_exerciseDetailsFuture("+backid+",'"+ids+"')";
					// break;
				}else{
					var backlink = false;
				}
			}
		};

		var trid =  window.localStorage.getItem('userlogin');

		var exercise;
		// var sqlite = 'SELECT * FROM exercise where id = '+id;
		var sqlite = 'SELECT `e`.`id`, `e`.`base64image`, `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" WHERE `e`.`id` = '+id;
		
		db.transaction(function(ltx) {
			ltx.executeSql(sqlite, [], function(ltx, exercise_results) {
				var exercise = exercise_results.rows.item(0);
				
				// sqlite = 'SELECT * FROM exercise_set where exercise_id = '+id+' ORDER BY id ASC';

				sqlite = 'SELECT `es`.`id`, `es`.`exercise_id`, `es`.`reps`, `es`.`time`, `es`.`value`, `esr`.`resultreps`, `esr`.`resulttime`, `esr`.`resultweight` FROM (`exercise_set` as es) LEFT JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id` AND `esr`.`trainee_id` = "'+trid+'" WHERE `es`.`exercise_id` = '+id+' ORDER BY `es`.`id` ASC';


				db.transaction(function(ktx) {
					ktx.executeSql(sqlite, [], function(ktx, exercise_set_results) {
						if(exercise.base64image != '' && exercise.base64image != '0'){
							$('#excerciseimage').attr('src', exercise.base64image);
							$('#excerciseimage')
								.load(function(){
									// alert('Image is loaded');
								})
								.error(function(){
									// alert('Image is not loaded');
									$('#excerciseimage').remove();
									$('#exercisedesc').css('padding-top', '50px');
								});
						}
						else{
							// $('#excerciseimage').attr('src', no_image);
							$('#excerciseimage').remove();
							$('#exercisedesc').css('padding-top', '50px');
						}

						$(".notes_trainer").css('opacity', '0');
						$(".notes_trainer_textarea").remove();

						$('#exercisename').html(exercise.name);
						$('#exercisedesc').html(exercise.description);
						var rest_time = exercise.resttime;
						if(rest_time == "" || rest_time == "0"){
							$('#resttime').val('1');
						}else{
							$('#resttime').val(rest_time);
						}
						
						$('.returnhome').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");          
						var i = 1;
						var j = 1;
						var content = "";          
						//alert(res.success.set.length);
						content += '<ons-row class="lt row ons-row-inner">';
						content +='<ons-col class="col ons-col-inner">Set</ons-col>';
						content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
						content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
						content +='<ons-col class="col ons-col-inner">Time</ons-col>';            
						content +='</ons-row>';
						var len = exercise_set_results.rows.length;
	      

						for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
							var exercise_set = exercise_set_results.rows.item(row_number);
							content += '<ons-row class="row ons-row-inner">';
							content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
							
							// content +='<ons-col class="col ons-col-inner"><i>'+exercise_set.value+'</i></ons-col>';            
							// content +='<ons-col class="col ons-col-inner"><i>'+exercise_set.reps+'</i></ons-col>';            
							
							var defaultweight = exercise_set.value;
							var defaultreps = exercise_set.reps;
							var defaulttime = exercise_set.time;

							content += '<ons-col class="col ons-col-inner" >';
							
							if(exercise_set.value != 'Body Weight' && exercise_set.value != 'N/A')	
								content += '<i>'+exercise_set.value+'</i> lbs'
							else if(exercise_set.value == 'Body Weight')
								content += '<i style="font-size:12px;">'+exercise_set.value+'</i>'
							else
								content += '<i>'+exercise_set.value+'</i>'
							
							content += '</ons-col>';

							content += '<ons-col class="col ons-col-inner">';
							content += '<i>'+exercise_set.reps+'</i>'
							content += '</ons-col>';

							content += '<ons-col class="col ons-col-inner">';
							
							if(exercise_set.time != 'N/A' && exercise_set.time != 'Failure' )
								content += '<i>'+sec_to_min(exercise_set.time)+'</i>'
							else
								content += '<i>'+exercise_set.time+'</i>'
							
							content += '</ons-col>';

							content +='</ons-row>';
							j++;
						}

						var h = 1;
						rcontent = "";           
						
						if(nxtlink != false){
			              $("#nxtt_btn").attr('onclick', nxtlink);
			            	$("#nxtt_btn").html('Next');
			            }
			            else{
			              $("#nxtt_btn").html('Done');
			              $('#nxtt_btn').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");   
			            }
						
						if(backlink != false){
			              $("#backk_btn").attr('onclick', backlink);
			              $("#backk_btn").css('background', '#FFF');
			            }
			            else{
			              $("#backk_btn").css('background', '#cccccc');
			            }

						$('#exercise_set').html(content);
						hideLoader();
						return; 
					})
				},dbError);
			})
		},dbError);
		hideLoader();
	},800);
}

function db_circuitExerciseDetailsFuture(id, ids){
	showLoader();
	setTimeout(function(){
		ids = ids.split(',');    
		
		for (var i = 0; i <= ids.length; i++) {                          
			if(id == ids[i]){
				if(ids[parseInt(i+1)]){        
					var nextid  = ids[parseInt(i+1)];
					nxtlink = "nextFutureCircuit("+id+","+nextid+",'"+ids+"')";
				}else{
					nxtlink = false;
				}

				if(ids[parseInt(i-1)]){        
					var backid  = ids[parseInt(i-1)];
					var backlink = "nextFutureCircuit("+id+","+backid+",'"+ids+"')";
					// break;
				}else{
					var backlink = false;
				}
			}
		};

		var trid =  window.localStorage.getItem('userlogin');

		var exercise;
		// var sqlite = 'SELECT * FROM exercise where id = '+id;
		var sqlite = 'SELECT `e`.`id`, `c`.`base64image` , `c`.`name` as circuit_name , `c`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" LEFT JOIN `circuit` as c ON `c`.`id` = `e`.`circuit_id` WHERE `c`.`id` = '+id;
		
		db.transaction(function(ltx) {
			ltx.executeSql(sqlite, [], function(ltx, exercise_results) {
				
				var exercise = exercise_results.rows.item(0);
				if(exercise.base64image != '' && exercise.base64image != '0'){
					$('#excerciseimage').attr('src', exercise.base64image);
					$('#excerciseimage')
						.load(function(){
							// alert('Image is loaded');
						})
						.error(function(){
							// alert('Image is not loaded');
							$('#excerciseimage').remove();
							$('#exercisedesc').css('padding-top', '50px');
						});
				}
				else{
					$('#excerciseimage').remove();
					$('#exercisedesc').css('padding-top', '50px');
				}

				$(".notes_trainer").css('opacity', '0');
				$(".notes_trainer_textarea").remove();

				$('#exercisename').html(exercise.circuit_name);
				
				$('#exercisedesc').html(exercise.circuit_description);
				var rest_time = exercise.resttime;
				if(rest_time == "" || rest_time == "0"){
					$('#resttime').val('1');
				}else{
					$('#resttime').val(rest_time);
				}

				$('.returnhome').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");  

				var wheree = [];
				var eIds = [];
				var done = [];
				for(var row_number=0;row_number < exercise_results.rows.length; row_number++) {
					var exercis = exercise_results.rows.item(row_number);                         
					


					wheree.push( ' `es`.`exercise_id` = '+exercis.id+' ' );
					eIds.push(exercis.id);
				}
				wheree = wheree.join(' OR ');

				
				sqlite = 'SELECT `es`.`id`, `ex`.`name` as exname , `es`.`exercise_id`, `es`.`reps`, `es`.`time`, `es`.`value`, `esr`.`resultreps`, `esr`.`resultweight`, `esr`.`resulttime` FROM (`exercise_set` as es) LEFT JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id` AND `esr`.`trainee_id` = "'+trid+'" LEFT JOIN `exercise` as ex ON `ex`.`id` = `es`.`exercise_id` WHERE '+wheree+' ORDER BY `es`.`id` ASC';


				db.transaction(function(ktx) {
					ktx.executeSql(sqlite, [], function(ktx, exercise_set_results) {
						var results = [];

								for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
									results.push(exercise_set_results.rows.item(row_number));
								}

								$.each ( eIds , function (iii,vv) {
									var arr = [];
									done.push(arr);
								});	



								$.each ( eIds , function (iii,vv) {
									$.each( results , function (ind , exercise_set) {
										if(parseInt(vv) == parseInt(exercise_set.exercise_id) ){
											done[iii].push( exercise_set );
										}
									} );

								});

								$.each( done, function( tt , pp ) {
									var i = 1;
									var j = 1;
									var content = "";

									content += '<ons-row class="lt row ons-row-inner" style="padding:10px 5px 15px 20px; margin-top: 10px ; color: #0091ae; background: #FFF;">';
									content += '<ons-col>'+ pp[0].exname +'</ons-col>';
									content += '</ons-row>';

									content += '<ons-row class="lt row ons-row-inner">';
									content +='<ons-col class="col ons-col-inner">Set</ons-col>';
									content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Time</ons-col>';            
									content +='</ons-row>';
									var len = pp.length;

									for(var row_number=0; row_number < len; row_number++) {
										var exercise_set = pp[row_number];
										content += '<ons-row class="row ons-row-inner">';
										content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
										
										var defaultweight = exercise_set.value;
										var defaultreps = exercise_set.reps;
										var defaulttime = exercise_set.time;

										content += '<ons-col class="col ons-col-inner" >';
										
										if(exercise_set.value != 'Body Weight' && exercise_set.value != 'N/A')	
											content += '<i>'+exercise_set.value+'</i> lbs'
										else if(exercise_set.value == 'Body Weight')
											content += '<i style="font-size:12px;">'+exercise_set.value+'</i>'
										else
											content += '<i>'+exercise_set.value+'</i>'
										
										content += '</ons-col>';

										content += '<ons-col class="col ons-col-inner">';
										content += '<i>'+exercise_set.reps+'</i>'
										content += '</ons-col>';

										content += '<ons-col class="col ons-col-inner">';
										
										if(exercise_set.time != 'N/A' && exercise_set.time != 'Failure' )
											content += '<i>'+sec_to_min(exercise_set.time)+'</i>'
										else
											content += '<i>'+exercise_set.time+'</i>'
										
										content += '</ons-col>';

										content +='</ons-row>';
										j++;
									}

									if(nxtlink != false){
						              $("#nxtt_btn").attr('onclick', nxtlink);
						              $("#nxtt_btn").html('Next');
						            }
						            else{
						              $("#nxtt_btn").html('Done');
						              $('#nxtt_btn').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");   
						            }
									
									if(backlink != false){
						              $("#backk_btn").attr('onclick', backlink);
						              $("#backk_btn").css('background', '#FFF');
						            }
						            else{
						              $("#backk_btn").css('background', '#cccccc');
						            }

									// alert(nxtlink);

									$("div.notes_trainer.bench .lt").css('opacity', '0');
									$("div.notes_trainer.bench .notes_trainer_textarea").hide();
									$('#exercise_set').append(content); 
									

									hideLoader();

								} );
					})
				},dbError);
			})
		},dbError);
		hideLoader();
	},800);
}

function db_circuitOrExerciseDetailsFuture(id, ids){
	showLoader();
	setTimeout(function(){
		ids = ids.split(',');    
		
		for (var i = 0; i <= ids.length; i++) {                          
			if(id == ids[i]){
				if(ids[parseInt(i+1)]){        
					var nextid  = ids[parseInt(i+1)];
					nxtlink = "nextFutureCircuitOrExercise('"+id+"','"+nextid+"','"+ids+"')";
				}else{
					nxtlink = false;
				}

				if(ids[parseInt(i-1)]){        
					var backid  = ids[parseInt(i-1)];
					var backlink = "nextFutureCircuitOrExercise('"+id+"','"+backid+"','"+ids+"')";
					// break;
				}else{
					var backlink = false;
				}
			}
		};

		var trid =  window.localStorage.getItem('userlogin');

		var exercise;
		// var sqlite = 'SELECT * FROM exercise where id = '+id;
		// var sqlite = 'SELECT `e`.`id`, `c`.`base64image` , `c`.`name` as circuit_name , `c`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` LEFT JOIN `circuit` as c ON `c`.`id` = `e`.`circuit_id` WHERE `c`.`id` = '+id;
		
		var temp_id = id.split('_');

		if(temp_id[0] == 'circuit')
			var sqlite = 'SELECT `e`.`id`, `c`.`base64image` , `c`.`name` as circuit_name , `c`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" LEFT JOIN `circuit` as c ON `c`.`id` = `e`.`circuit_id` WHERE `c`.`id` = '+temp_id[1];
		else
			var sqlite = 'SELECT `e`.`id`, `e`.`base64image` , `e`.`name` as circuit_name , `e`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" WHERE `e`.`id` = '+temp_id[1];

		db.transaction(function(ltx) {
			ltx.executeSql(sqlite, [], function(ltx, exercise_results) {
				
				var exercise = exercise_results.rows.item(0);
				if(exercise.base64image != '' && exercise.base64image != '0'){
					$('#excerciseimage').attr('src', exercise.base64image);
					$('#excerciseimage')
						.load(function(){
							// alert('Image is loaded');
						})
						.error(function(){
							// alert('Image is not loaded');
							$('#excerciseimage').remove();
							$('#exercisedesc').css('padding-top', '50px');
						});
				}
				else{
					$('#excerciseimage').remove();
					$('#exercisedesc').css('padding-top', '50px');
				}

				$(".notes_trainer").css('opacity', '0');
				$(".notes_trainer_textarea").remove();

				$('#exercisename').html(exercise.circuit_name);
				
				$('#exercisedesc').html(exercise.circuit_description);
				var rest_time = exercise.resttime;
				if(rest_time == "" || rest_time == "0"){
					$('#resttime').val('1');
				}else{
					$('#resttime').val(rest_time);
				}

				$('.returnhome').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");  

				var wheree = [];
				var eIds = [];
				var done = [];
				for(var row_number=0;row_number < exercise_results.rows.length; row_number++) {
					var exercis = exercise_results.rows.item(row_number);                         
					


					wheree.push( ' `es`.`exercise_id` = '+exercis.id+' ' );
					eIds.push(exercis.id);
				}
				wheree = wheree.join(' OR ');

				
				sqlite = 'SELECT `es`.`id`, `ex`.`name` as exname , `es`.`exercise_id`, `es`.`reps`, `es`.`time`, `es`.`value`, `esr`.`resultreps`, `esr`.`resultweight`, `esr`.`resulttime` FROM (`exercise_set` as es) LEFT JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id` AND `esr`.`trainee_id` = "'+trid+'" LEFT JOIN `exercise` as ex ON `ex`.`id` = `es`.`exercise_id` WHERE '+wheree+' ORDER BY `es`.`id` ASC';


				db.transaction(function(ktx) {
					ktx.executeSql(sqlite, [], function(ktx, exercise_set_results) {
						var results = [];

								for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
									results.push(exercise_set_results.rows.item(row_number));
								}

								$.each ( eIds , function (iii,vv) {
									var arr = [];
									done.push(arr);
								});	



								$.each ( eIds , function (iii,vv) {
									$.each( results , function (ind , exercise_set) {
										if(parseInt(vv) == parseInt(exercise_set.exercise_id) ){
											done[iii].push( exercise_set );
										}
									} );

								});

								$.each( done, function( tt , pp ) {
									var i = 1;
									var j = 1;
									var content = "";

									if(temp_id[0] == 'circuit'){
										content += '<ons-row class="lt row ons-row-inner" style="padding:10px 5px 15px 20px; margin-top: 10px ; color: #0091ae; background: #FFF;">';
										content += '<ons-col>'+ pp[0].exname +'</ons-col>';
										content += '</ons-row>';
									}

									content += '<ons-row class="lt row ons-row-inner">';
									content +='<ons-col class="col ons-col-inner">Set</ons-col>';
									content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Time</ons-col>';            
									content +='</ons-row>';
									var len = pp.length;

									for(var row_number=0; row_number < len; row_number++) {
										var exercise_set = pp[row_number];
										content += '<ons-row class="row ons-row-inner">';
										content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
										
										var defaultweight = exercise_set.value;
										var defaultreps = exercise_set.reps;
										var defaulttime = exercise_set.time;

										content += '<ons-col class="col ons-col-inner" >';
										
										if(exercise_set.value != 'Body Weight' && exercise_set.value != 'N/A')	
											content += '<i>'+exercise_set.value+'</i> lbs'
										else if(exercise_set.value == 'Body Weight')
											content += '<i style="font-size:12px;">'+exercise_set.value+'</i>'
										else
											content += '<i>'+exercise_set.value+'</i>'
										
										content += '</ons-col>';

										content += '<ons-col class="col ons-col-inner">';
										content += '<i>'+exercise_set.reps+'</i>'
										content += '</ons-col>';

										content += '<ons-col class="col ons-col-inner">';
										
										if(exercise_set.time != 'N/A' && exercise_set.time != 'Failure' )
											content += '<i>'+sec_to_min(exercise_set.time)+'</i>'
										else
											content += '<i>'+exercise_set.time+'</i>'
										
										content += '</ons-col>';

										content +='</ons-row>';
										j++;
									}

									if(nxtlink != false){
						              $("#nxtt_btn").attr('onclick', nxtlink);
						              $("#nxtt_btn").html('Next');
						            }
						            else{
						              $("#nxtt_btn").html('Done');
						              $('#nxtt_btn').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");   
						            }
									
									if(backlink != false){
						              $("#backk_btn").attr('onclick', backlink);
						              $("#backk_btn").css('background', '#FFF');
						            }
						            else{
						              $("#backk_btn").css('background', '#cccccc');
						            }

									// alert(nxtlink);

									$("div.notes_trainer.bench .lt").css('opacity', '0');
									$("div.notes_trainer.bench .notes_trainer_textarea").hide();
									$('#exercise_set').append(content); 
									

									hideLoader();

								} );
					})
				},dbError);
			})
		},dbError);
		hideLoader();
	},800);
}

function db_circuitOldEexerciseDetails(id, ids){
	showLoader();
	// $('#exercise_set').append('');
	setTimeout(function(){
		ids = ids.split(',');    
		
		for (var i = 0; i <= ids.length; i++) {                          
			if(id == ids[i]){
				if(ids[parseInt(i+1)]){        
					var nextid  = ids[parseInt(i+1)];
					nxtlink = "oldNextCircuit("+id+","+nextid+",'"+ids+"')";
				}else{
					nxtlink = false;
				}

				if(ids[parseInt(i-1)]){        
					var backid  = ids[parseInt(i-1)];
					var backlink = "oldNextCircuit("+id+","+backid+",'"+ids+"')";
					// break;
				}else{
					var backlink = false;
				}
			}
		};

		var trid =  window.localStorage.getItem('userlogin');

		var exercise;
		// var sqlite = 'SELECT * FROM exercise where id = '+id;
		var sqlite = 'SELECT `e`.`id`, `c`.`base64image` , `c`.`name` as circuit_name , `c`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" LEFT JOIN `circuit` as c ON `c`.`id` = `e`.`circuit_id` WHERE `c`.`id` = '+id;
			
		// alert(sqlite);

		db.transaction(function(ltx) {
			ltx.executeSql(sqlite, [], function(ltx, exercise_results) {
	
				// alert(exercise_results.rows.length);

				var exercise = exercise_results.rows.item(0);
				if(exercise.base64image != '' && exercise.base64image != '0'){
					$('#excerciseimage').attr('src', exercise.base64image);
					$('#excerciseimage')
						.load(function(){
							// alert('Image is loaded');
						})
						.error(function(){
							// alert('Image is not loaded');
							$('#excerciseimage').remove();
							$('#exercisedesc').css('padding-top', '50px');
						});
				}
				else{
					$('#excerciseimage').remove();
					$('#exercisedesc').css('padding-top', '50px');
				}

				$(".notes_trainer").css('opacity', '0');
				$(".notes_trainer_textarea").remove();

				$('#exercisename').html(exercise.circuit_name);
				
				$('#exercisedesc').html(exercise.circuit_description);
				var rest_time = exercise.resttime;
				if(rest_time == "" || rest_time == "0"){
					$('#resttime').val('1');
				}else{
					$('#resttime').val(rest_time);
				}

				$('.returnhome').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");  

				var wheree = [];
				var eIds = [];
				var done = [];
				// for (var iii = 0; iii <= ids.length; iii++) {                          
				// 	if(ids[iii] != undefined){
				// 		wheree.push( ' `es`.`exercise_id` = '+ids[iii]+' ' );
				// 		eIds.push(ids[iii]);
				// 	}
				// }
				// wheree = wheree.join(' OR ');

				for(var row_number=0;row_number < exercise_results.rows.length; row_number++) {
					var exercis = exercise_results.rows.item(row_number);                         
					


					wheree.push( ' `es`.`exercise_id` = '+exercis.id+' ' );
					eIds.push(exercis.id);
				}
				wheree = wheree.join(' OR ');

				
				sqlite = 'SELECT `es`.`id`, `ex`.`name` as exname , `es`.`exercise_id`, `es`.`reps`, `es`.`time`, `es`.`value`, `esr`.`resultreps`, `esr`.`resultweight`, `esr`.`resulttime` FROM (`exercise_set` as es) LEFT JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id` AND `esr`.`trainee_id` = "'+trid+'" LEFT JOIN `exercise` as ex ON `ex`.`id` = `es`.`exercise_id` WHERE '+wheree+' ORDER BY `es`.`id` ASC';


				db.transaction(function(ktx) {
					ktx.executeSql(sqlite, [], function(ktx, exercise_set_results) {
						var results = [];

								for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
									results.push(exercise_set_results.rows.item(row_number));
								}

								$.each ( eIds , function (iii,vv) {
									var arr = [];
									done.push(arr);
								});	



								$.each ( eIds , function (iii,vv) {
									$.each( results , function (ind , exercise_set) {
										if(parseInt(vv) == parseInt(exercise_set.exercise_id) ){
											done[iii].push( exercise_set );
										}
									} );

								});

								$.each( done, function( tt , pp ) {
									var i = 1;
									var j = 1;
									var content = "";

									content += '<ons-row class="lt row ons-row-inner" style="padding:10px 5px 15px 20px; margin-top: 10px ; color: #0091ae; background: #FFF;">';
									content += '<ons-col>'+ pp[0].exname +'</ons-col>';
									content += '</ons-row>';

									content += '<ons-row class="lt row ons-row-inner">';
									content +='<ons-col class="col ons-col-inner">Set</ons-col>';
									content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Time</ons-col>';            
									content +='</ons-row>';
									var len = pp.length;

									for(var row_number=0; row_number < len; row_number++) {
										var exercise_set = pp[row_number];
										content += '<ons-row class="row ons-row-inner">';
										content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
										
										// content +='<ons-col class="col ons-col-inner"><i>'+exercise_set.value+'</i></ons-col>';            
										// content +='<ons-col class="col ons-col-inner"><i>'+exercise_set.reps+'</i></ons-col>';            
										
										if(exercise_set.value != 'Body Weight' && exercise_set.value != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
											
											if( exercise_set.resultweight == null )
												content += '<i class="red">'+'0'+'</i> lbs'
											else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) )
												content += '<i class="red">'+exercise_set.resultweight+'</i> lbs'
											else if( parseInt(exercise_set.resultweight) > parseInt(exercise_set.value) )
												content += '<i class="green">'+exercise_set.resultweight+'</i> lbs'
											else
												content += '<i>'+exercise_set.resultweight+'</i> lbs'
											
											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
											
											if(exercise_set.value == 'Body Weight')
												content += '<i style="font-size:12px;">'+exercise_set.value+'</i>'
											else
												content += '<i>'+exercise_set.value+'</i>'
											
											content += '</ons-col>';
										}



										if(exercise_set.reps != 'Failure' && exercise_set.reps != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
											
											// content += '<i>'+exercise_set.reps+'</i>'

											if( exercise_set.resultreps == null )
												content += '<i class="red">'+'0'+'</i>'
											else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) )
												content += '<i class="red">'+exercise_set.resultreps+'</i>'
											else if( parseInt(exercise_set.resultreps) > parseInt(exercise_set.reps) )
												content += '<i class="green">'+exercise_set.resultreps+'</i>'
											else
												content += '<i>'+exercise_set.resultreps+'</i>'
											

											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
											
											content += '<i>'+exercise_set.reps+'</i>'
											

											content += '</ons-col>';
										}

										if(exercise_set.time != '' && exercise_set.time != 'Failure' && exercise_set.time != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
											
											// content += '<i>'+exercise_set.reps+'</i>'

											if( exercise_set.resulttime == null )
												content += '<i class="red">'+'0s'+'</i>'
											else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) )
												content += '<i class="red">'+sec_to_min(exercise_set.resulttime)+'</i>'
											else if( parseInt(exercise_set.resulttime) > parseInt(exercise_set.time) )
												content += '<i class="green">'+sec_to_min(exercise_set.resulttime)+'</i>'
											else
												content += '<i>'+sec_to_min(exercise_set.resulttime)+'</i>'
											

											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
											
											if(exercise_set.time == '')
												content += '<i>N/A</i>'
											else	
												content += '<i>'+exercise_set.time+'</i>'
											

											content += '</ons-col>';
										}

										content += '</ons-row>';
										j++;
									}

									// $("#backk_btn").remove();

									// $("#nxtt_btn").css('width', '100%');
									
									// $("#nxtt_btn").html('Done');
			      //         			$('#nxtt_btn').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");

			      					if(nxtlink != false){
										$("#nxtt_btn").attr('onclick', nxtlink);
									}
									else{
										$("#nxtt_btn").html('Done');
										$("#nxtt_btn").attr('onclick',"return oldreturntohome("+exercise.workout_id+")");
									}
									
									if(backlink != false){
										$("#backk_btn").attr('onclick', backlink);
									}
									else{
										$("#backk_btn").css('background', '#cccccc');
									}

									// alert(nxtlink);

									$("div.notes_trainer.bench .lt").css('opacity', '0');
									$("div.notes_trainer.bench .notes_trainer_textarea").hide();
									$('#exercise_set').append(content); 
									

									hideLoader();

								} );
					})
				},dbError);
			})
		},dbError);
		hideLoader();
	},800);
}

function db_oldCircuitOrExerciseDetails(id, ids){
	showLoader();
	// $('#exercise_set').append('');
	setTimeout(function(){
		ids = ids.split(',');    
		
		for (var i = 0; i <= ids.length; i++) {                          
			if(id == ids[i]){
				if(ids[parseInt(i+1)]){        
					var nextid  = ids[parseInt(i+1)];
					nxtlink = "oldNextCircuitOrExercise('"+id+"','"+nextid+"','"+ids+"')";
				}else{
					nxtlink = false;
				}

				if(ids[parseInt(i-1)]){        
					var backid  = ids[parseInt(i-1)];
					var backlink = "oldNextCircuitOrExercise('"+id+"','"+backid+"','"+ids+"')";
					// break;
				}else{
					var backlink = false;
				}
			}
		};

		var trid =  window.localStorage.getItem('userlogin');

		var exercise;
		// var sqlite = 'SELECT * FROM exercise where id = '+id;
		
		// var sqlite = 'SELECT `e`.`id`, `c`.`base64image` , `c`.`name` as circuit_name , `c`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` LEFT JOIN `circuit` as c ON `c`.`id` = `e`.`circuit_id` WHERE `c`.`id` = '+id;
		
		var temp_id = id.split('_');

		if(temp_id[0] == 'circuit')
			var sqlite = 'SELECT `e`.`id`, `c`.`base64image` , `c`.`name` as circuit_name , `c`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" LEFT JOIN `circuit` as c ON `c`.`id` = `e`.`circuit_id` WHERE `c`.`id` = '+temp_id[1];
		else
			var sqlite = 'SELECT `e`.`id`, `e`.`base64image` , `e`.`name` as circuit_name , `e`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" WHERE `e`.`id` = '+temp_id[1];

		// alert(id);

		db.transaction(function(ltx) {
			ltx.executeSql(sqlite, [], function(ltx, exercise_results) {
				
				var exercise = exercise_results.rows.item(0);
				if(exercise.base64image != '' && exercise.base64image != '0'){
					$('#excerciseimage').attr('src', exercise.base64image);
					$('#excerciseimage')
						.load(function(){
							// alert('Image is loaded');
						})
						.error(function(){
							// alert('Image is not loaded');
							$('#excerciseimage').remove();
							$('#exercisedesc').css('padding-top', '50px');
						});
				}
				else{
					$('#excerciseimage').remove();
					$('#exercisedesc').css('padding-top', '50px');
				}

				$(".notes_trainer").css('opacity', '0');
				$(".notes_trainer_textarea").remove();

				$('#exercisename').html(exercise.circuit_name);
				
				$('#exercisedesc').html(exercise.circuit_description);
				var rest_time = exercise.resttime;
				if(rest_time == "" || rest_time == "0"){
					$('#resttime').val('1');
				}else{
					$('#resttime').val(rest_time);
				}

				$('.returnhome').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");  

				var wheree = [];
				var eIds = [];
				var done = [];
				// for (var iii = 0; iii <= ids.length; iii++) {                          
				// 	if(ids[iii] != undefined){
				// 		wheree.push( ' `es`.`exercise_id` = '+ids[iii]+' ' );
				// 		eIds.push(ids[iii]);
				// 	}
				// }
				// wheree = wheree.join(' OR ');

				for(var row_number=0;row_number < exercise_results.rows.length; row_number++) {
					var exercis = exercise_results.rows.item(row_number);                         
					


					wheree.push( ' `es`.`exercise_id` = '+exercis.id+' ' );
					eIds.push(exercis.id);
				}
				wheree = wheree.join(' OR ');

				
				sqlite = 'SELECT `es`.`id`, `ex`.`name` as exname , `es`.`exercise_id`, `es`.`reps`, `es`.`time`, `es`.`value`, `esr`.`resultreps`, `esr`.`resultweight`, `esr`.`resulttime` FROM (`exercise_set` as es) LEFT JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id` AND `esr`.`trainee_id` = "'+trid+'" LEFT JOIN `exercise` as ex ON `ex`.`id` = `es`.`exercise_id` WHERE '+wheree+' ORDER BY `es`.`id` ASC';


				db.transaction(function(ktx) {
					ktx.executeSql(sqlite, [], function(ktx, exercise_set_results) {
						var results = [];

								for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
									results.push(exercise_set_results.rows.item(row_number));
								}

								$.each ( eIds , function (iii,vv) {
									var arr = [];
									done.push(arr);
								});	



								$.each ( eIds , function (iii,vv) {
									$.each( results , function (ind , exercise_set) {
										if(parseInt(vv) == parseInt(exercise_set.exercise_id) ){
											done[iii].push( exercise_set );
										}
									} );

								});

								$.each( done, function( tt , pp ) {
									var i = 1;
									var j = 1;
									var content = "";

									if(temp_id[0] == 'circuit'){
										content += '<ons-row class="lt row ons-row-inner" style="padding:10px 5px 15px 20px; margin-top: 10px ; color: #0091ae; background: #FFF;">';
										content += '<ons-col>'+ pp[0].exname +'</ons-col>';
										content += '</ons-row>';
									}

									content += '<ons-row class="lt row ons-row-inner">';
									content +='<ons-col class="col ons-col-inner">Set</ons-col>';
									content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Time</ons-col>';            
									content +='</ons-row>';
									var len = pp.length;

									for(var row_number=0; row_number < len; row_number++) {
										var exercise_set = pp[row_number];
										content += '<ons-row class="row ons-row-inner">';
										content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
										
										// content +='<ons-col class="col ons-col-inner"><i>'+exercise_set.value+'</i></ons-col>';            
										// content +='<ons-col class="col ons-col-inner"><i>'+exercise_set.reps+'</i></ons-col>';            
										
										if(exercise_set.value != 'Body Weight' && exercise_set.value != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
											
											if( exercise_set.resultweight == null )
												content += '<i class="red">'+'0'+'</i> lbs'
											else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) )
												content += '<i class="red">'+exercise_set.resultweight+'</i> lbs'
											else if( parseInt(exercise_set.resultweight) > parseInt(exercise_set.value) )
												content += '<i class="green">'+exercise_set.resultweight+'</i> lbs'
											else
												content += '<i>'+exercise_set.resultweight+'</i> lbs'
											
											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
											
											if(exercise_set.value == 'Body Weight')
												content += '<i style="font-size:12px;">'+exercise_set.value+'</i>'
											else
												content += '<i>'+exercise_set.value+'</i>'
											
											content += '</ons-col>';
										}



										if(exercise_set.reps != 'Failure' && exercise_set.reps != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
											
											// content += '<i>'+exercise_set.reps+'</i>'

											if( exercise_set.resultreps == null )
												content += '<i class="red">'+'0'+'</i>'
											else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) )
												content += '<i class="red">'+exercise_set.resultreps+'</i>'
											else if( parseInt(exercise_set.resultreps) > parseInt(exercise_set.reps) )
												content += '<i class="green">'+exercise_set.resultreps+'</i>'
											else
												content += '<i>'+exercise_set.resultreps+'</i>'
											

											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
											
											content += '<i>'+exercise_set.reps+'</i>'
											

											content += '</ons-col>';
										}

										if(exercise_set.time != '' && exercise_set.time != 'Failure' && exercise_set.time != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
											
											// content += '<i>'+exercise_set.reps+'</i>'

											if( exercise_set.resulttime == null )
												content += '<i class="red">'+'0s'+'</i>'
											else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) )
												content += '<i class="red">'+sec_to_min(exercise_set.resulttime)+'</i>'
											else if( parseInt(exercise_set.resulttime) > parseInt(exercise_set.time) )
												content += '<i class="green">'+sec_to_min(exercise_set.resulttime)+'</i>'
											else
												content += '<i>'+sec_to_min(exercise_set.resulttime)+'</i>'
											

											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
											
											if(exercise_set.time == '')
												content += '<i>N/A</i>'
											else	
												content += '<i>'+exercise_set.time+'</i>'
											

											content += '</ons-col>';
										}

										content += '</ons-row>';
										j++;
									}

									// $("#backk_btn").remove();

									// $("#nxtt_btn").css('width', '100%');
									
									// $("#nxtt_btn").html('Done');
			      //         			$('#nxtt_btn').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");

			      					if(nxtlink != false){
										$("#nxtt_btn").attr('onclick', nxtlink);
									}
									else{
										$("#nxtt_btn").html('Done');
										$("#nxtt_btn").attr('onclick',"return oldreturntohome("+exercise.workout_id+")");
									}
									
									if(backlink != false){
										$("#backk_btn").attr('onclick', backlink);
									}
									else{
										$("#backk_btn").css('background', '#cccccc');
									}

									// alert(nxtlink);

									$("div.notes_trainer.bench .lt").css('opacity', '0');
									$("div.notes_trainer.bench .notes_trainer_textarea").hide();
									$('#exercise_set').append(content); 
									

									hideLoader();

								} );
					})
				},dbError);
			})
		},dbError);
		hideLoader();
	},800);
}

function db_exerciseDetails(id, ids){
	if(window.localStorage.getItem('do_exercise') === '0'){
		db_exerciseDetailsFuture(id, ids)
		return 0;
	}

	showLoader();
	setTimeout(function(){
		setUserFullName();
		ids = ids.split(',');    
		for (var i = 0; i <= ids.length; i++) {                          
			if(id == ids[i]){
				if(ids[parseInt(i+1)]){        
					var nextid  = ids[parseInt(i+1)];
					nxtlink = "Nextexercise("+id+","+nextid+",'"+ids+"')";
					// break;
				}else{
					nxtlink="show_cooldownmodal("+id+");";
					$('#nxtexercise').html('Complete <img src="images/arr-r.png" style="opacity:0">');
				}

				if(ids[parseInt(i-1)]){        
					var backid  = ids[parseInt(i-1)];
					var backlink = "Backexercise("+id+","+backid+",'"+ids+"')";
					// break;
				}else{
					var backlink = false;
				}
			}
		};

		var trid =  window.localStorage.getItem('userlogin');

		var exercise;
		// var sqlite = 'SELECT * FROM exercise where id = '+id;
		var sqlite = 'SELECT `e`.`id`, `e`.`base64image`, `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" WHERE `e`.`id` = '+id;
		
		db.transaction(function(ltx) {
			ltx.executeSql(sqlite, [], function(ltx, exercise_results) {
				var exercise = exercise_results.rows.item(0);
				
				// sqlite = 'SELECT * FROM exercise_set where exercise_id = '+id+' ORDER BY id ASC';

				sqlite = 'SELECT `es`.`id`, `es`.`exercise_id`, `es`.`reps`, `es`.`time`, `es`.`value`, `esr`.`resultreps`, `esr`.`resultweight`, `esr`.`resulttime` FROM (`exercise_set` as es) LEFT JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id` AND `esr`.`trainee_id` = "'+trid+'" WHERE `es`.`exercise_id` = '+id+' ORDER BY `es`.`id` ASC';


				db.transaction(function(ktx) {
					ktx.executeSql(sqlite, [], function(ktx, exercise_set_results) {
						if(exercise.base64image != '' && exercise.base64image != '0'){
							$('#excerciseimage').attr('src', exercise.base64image);
							$('#excerciseimage')
								.load(function(){
									// alert('Image is loaded');
								})
								.error(function(){
									// alert('Image is not loaded');
									$('#excerciseimage').remove();
									$('#exercisedesc').css('padding-top', '50px');
								});
						}
						else{
							// $('#excerciseimage').attr('src', no_image);
							$('#excerciseimage').remove();
							$('#exercisedesc').css('padding-top', '50px');
						}

						$("#exercise_notes_div").show();

						if(exercise.notes != null)
							$("#exercise_notes").val(exercise.notes);

						if(exercise.wnotes != null)
							$("#workout_notes").val(exercise.wnotes);

						$('#exercisename').html(exercise.name);
						$('#exercisedesc').html(exercise.description);
						var rest_time = exercise.resttime;
						if(rest_time == "" || rest_time == "0"){
							$('#resttime').val('1');
						}else{
							$('#resttime').val(rest_time);
						}
						
						$('.returnhome').attr('onclick',"return returntohome("+exercise.workout_id+")"); 
						$("#workout_iddd").val(exercise.workout_id);         
						var i = 1;
						var j = 1;
						var content = "";          
						//alert(res.success.set.length);
						content += '<ons-row class="lt row ons-row-inner">';
						content +='<ons-col class="col ons-col-inner">Set</ons-col>';
						content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
						content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
						content +='<ons-col class="col ons-col-inner">Time</ons-col>';            
						content +='</ons-row>';
						var len = exercise_set_results.rows.length;
	      

						for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
							var exercise_set = exercise_set_results.rows.item(row_number);
							content += '<ons-row class="row ons-row-inner">';
							content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
							
							// content +='<ons-col class="col ons-col-inner"><i>'+exercise_set.value+'</i></ons-col>';            
							// content +='<ons-col class="col ons-col-inner"><i>'+exercise_set.reps+'</i></ons-col>';            
							
							var defaultweight = exercise_set.value;
							var defaultreps = exercise_set.reps;
							var defaulttime = exercise_set.time;

							if(defaultweight != 'Body Weight' && defaultweight != 'N/A'){
								content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
								
								if( exercise_set.resultweight == null ){
									content += '<i>'+exercise_set.value+'</i> lbs <img src="./images/up_down-arr.png" >'
								}
								else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) ){
									content += '<i class="red">'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
									defaultweight = exercise_set.resultweight;
								}
								else if( parseInt(exercise_set.resultweight) > parseInt(exercise_set.value) ){
									content += '<i class="green">'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
									defaultweight = exercise_set.resultweight;
								}
								else{
									content += '<i>'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
									defaultweight = exercise_set.resultweight;
								}

								content += '<select class="s_new_values">';
								for (var ii = 1; ii <= 1000; ii++) {
									var tset = '';
									if(ii == parseInt(exercise_set.value)){
										tset = 'Trainer set to : ';
									}

									if(parseInt(defaultweight) == ii )              
										content += '<option selected="selected" value="'+ii+'">'+tset+ii+'</option>';
									else
										content += '<option value="'+ii+'">'+tset+ii+'</option>';
								};
								content += '</select>';
								content += '</ons-col>';
							}
							else{
								content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
								
								if(defaultweight == 'Body Weight')
									content += '<i style="font-size:12px;">'+defaultweight+'</i>';
								else
									content += '<i>'+defaultweight+'</i>';
								

								content += '<select class="s_new_values" style="display:none;">';
								content += '<option selected="selected" value="'+defaultweight+'">Trainer set to : '+defaultweight+'</option>';
								content += '</select>';
								content += '</ons-col>';
							}


							if(defaultreps != 'Failure' && defaultreps != 'N/A'){
								content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
								
								// content += '<i>'+exercise_set.reps+'</i> <img src="./images/up_down-arr.png" >'
								
								if( exercise_set.resultreps == null ){
									content += '<i>'+exercise_set.reps+'</i> <img src="./images/up_down-arr.png" >'
								}
								else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) ){
									content += '<i class="red">'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
									defaultreps = exercise_set.resultreps;
								}
								else if( parseInt(exercise_set.resultreps) > parseInt(exercise_set.reps) ){
									content += '<i class="green">'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
									defaultreps = exercise_set.resultreps;
								}
								else{
									content += '<i>'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
									defaultreps = exercise_set.resultreps;
								}

								content += '<select class="s_new_values">';
								for (var jj = 1; jj <= 100; jj++) {
									var tset = '';
									if(jj == parseInt(exercise_set.reps)){
										tset = 'Trainer set to : ';
									}

									if(parseInt(defaultreps) == jj )              
										content += '<option selected="selected" value="'+jj+'">'+tset+jj+'</option>';
									else
										content += '<option value="'+jj+'">'+tset+jj+'</option>';
								};
								content += '</select>';
								content += '</ons-col>';
							}
							else{
								content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
								
								content += '<i>'+exercise_set.reps+'</i>';
								

								content += '<select class="s_new_values" style="display:none;">';
								content += '<option selected="selected" value="'+exercise_set.reps+'">Trainer set to : '+exercise_set.reps+'</option>';
								content += '</select>';
								content += '</ons-col>';
							}



							if(defaulttime != 'Failure' && defaulttime != 'N/A'){
								content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
								
								// content += '<i>'+exercise_set.reps+'</i> <img src="./images/up_down-arr.png" >'
								
								if( exercise_set.resulttime == null ){
									content += '<i>'+sec_to_min(exercise_set.time)+'</i> <img src="./images/up_down-arr.png" >'
								}
								else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) ){
									content += '<i class="red">'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
									defaulttime = exercise_set.resulttime;
								}
								else if( parseInt(exercise_set.resulttime) > parseInt(exercise_set.time) ){
									content += '<i class="green">'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
									defaulttime = exercise_set.resulttime;
								}
								else{
									content += '<i>'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
									defaulttime = exercise_set.resulttime;
								}

								content += '<select class="s_new_values">';
								for (var jj = 1; jj <= 900; jj++) {
									var tset = '';
									if(jj == parseInt(exercise_set.time)){
										tset = 'Trainer set to : ';
									}

									if(parseInt(defaulttime) == jj )              
										content += '<option selected="selected" value="'+jj+'">'+tset+sec_to_min(jj)+'</option>';
									else
										content += '<option value="'+jj+'">'+tset+sec_to_min(jj)+'</option>';
								};
								content += '</select>';
								content += '</ons-col>';
							}
							else{
								content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
								content += '<i>'+exercise_set.time+'</i>';
								

								content += '<select class="s_new_values" style="display:none;">';
								content += '<option selected="selected" value="'+exercise_set.time+'">Trainer set to : '+exercise_set.time+'</option>';
								content += '</select>';
								content += '</ons-col>';
							}


							content +='</ons-row>';
							j++;
						}

						var h = 1;
						rcontent = "";           
						// rcontent += '<div class="success"><p>Success!</p><h3>You finished this round!</h3></div><div class="results left"><h4>Results</h4></div>';

						for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
							var exercise_set = exercise_set_results.rows.item(row_number);
							
							var defltweight = exercise_set.value;
							var defltreps = exercise_set.reps;
							var deflttime = exercise_set.time;

							if( exercise_set.resultweight == null ){
							}
							else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) ){
								defltweight = exercise_set.resultweight;
							}
							else{
								defltweight = exercise_set.resultweight;
							}

							if( exercise_set.resultreps == null ){
							}
							else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) ){
								defltreps = exercise_set.resultreps;
							}
							else{
								defltreps = exercise_set.resultreps;
							}

							if( exercise_set.resulttime == null ){
							}
							else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) ){
								deflttime = exercise_set.resulttime;
							}
							else{
								deflttime = exercise_set.resulttime;
							}

							rcontent +='<div class="bench pad_lt"><ons-row class="row ons-row-inner" ><ons-col class="col ons-col-inner">Set '+h+'</ons-col><ons-col class="col ons-col-inner">Weight</ons-col><ons-col class="col ons-col-inner">Reps</ons-col></ons-row></div>';
							rcontent +='<div class="results left"><ons-row class="row ons-row-inner res_set res_set_'+exercise_set.id+'" id="'+exercise_set.id+'" >';
							rcontent +='<ons-col class="col ons-col-inner"></ons-col>';
							
							if(exercise_set.value != 'Body Weight' && exercise_set.value != 'N/A'){
								rcontent +='<ons-col class="col ons-col-inner"><div class="counter">';
								rcontent +='<select class="counterselect wselect">';
								for (var ii = 1; ii <= 1000; ii++) {
									if(parseInt(defltweight) == ii )              
										rcontent += '<option selected="selected" value="'+ii+'">Trainer set to : '+ii+'</option>';
									else
										rcontent += '<option value="'+ii+'">'+ii+'</option>';
								};
								rcontent+="</select></div></ons-col>";
							}
							else{
								rcontent +='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
								rcontent +='<select class="counterselect wselect">';
								rcontent += '<option selected="selected" value="'+exercise_set.value+'">Trainer set to : '+exercise_set.value+'</option>';
								rcontent+="</select></div></ons-col>";
							}

							if(exercise_set.reps != 'Failure' && exercise_set.reps != 'N/A'){
								rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
								rcontent+='<select class="counterselect rselect">';
								for (var jj = 1; jj <= 100; jj++) {
									if(parseInt(defltreps) == jj )              
										rcontent += '<option selected="selected" value="'+jj+'">Trainer set to : '+jj+'</option>';
									else
										rcontent += '<option value="'+jj+'">'+jj+'</option>';
								};
								rcontent+="</select></div></ons-col>";
							}
							else{
								rcontent+='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
								rcontent+='<select class="counterselect rselect">';
								rcontent += '<option selected="selected" value="'+exercise_set.reps+'">Trainer set to : '+exercise_set.reps+'</option>';
								rcontent+="</select></div></ons-col>";
							}

							if(exercise_set.time != 'Failure' && exercise_set.time != 'N/A'){
								rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
								rcontent+='<select class="counterselect tselect">';
								for (var jj = 1; jj <= 900; jj++) {
									if(parseInt(deflttime) == jj )              
										rcontent += '<option selected="selected" value="'+jj+'">Trainer set to : '+sec_to_min(jj)+'</option>';
									else
										rcontent += '<option value="'+jj+'">'+sec_to_min(jj)+'</option>';
								};
								rcontent+="</select></div></ons-col>";
							}
							else{
								rcontent+='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
								rcontent+='<select class="counterselect tselect">';
								rcontent+='<option selected="selected" value="'+exercise_set.time+'">Trainer set to : '+exercise_set.time+'</option>';
								rcontent+="</select></div></ons-col>";
							}

							rcontent+='</ons-row></div>';
							h++;
						}

						// rcontent +='<a href="#" class="full blue" onclick="return '+nxtlink+'" style="margin:10px 18px;">Next</a>';
						$("#nxtt_btn").attr('onclick', nxtlink);
						
						if(backlink != false){
							$("#backk_btn").attr('onclick', backlink);
						}
						else{
							$("#backk_btn").css('background', '#cccccc');
						}

						var s_ids="";
						var o = 1;
						var s_id = "";

						for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
							var exercise_set = exercise_set_results.rows.item(row_number);
							if(o == 1){
								s_id = exercise_set.id;
							}

							if(o !=1){
								s_ids += ',';
							}

							s_ids +=exercise_set.id;
							o++;
						}

						var s = 1;

						setcontent = "";           
						/*
						setcontent += '<div class="success"><p>Success!</p><h3>You finished this round!</h3></div><div class="results left"><h4>Results</h4></div>';           

						for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
							var exercise_set = exercise_set_results.rows.item(row_number);
							if(s==1){
								$('.setone').attr('onclick','return showsetmodalbox('+exercise_set.id+', \''+s_ids+'\',"YES")');
							}

							setcontent += '<div class="bench pad_lt hideset set'+exercise_set.id+'"><ons-row class="row ons-row-inner" ><ons-col class="col ons-col-inner">Set '+s+'</ons-col><ons-col class="col ons-col-inner">Weight</ons-col><ons-col class="col ons-col-inner">Reps</ons-col></ons-row></div>';
							setcontent +='<div class="results left hideset set'+exercise_set.id+'"><ons-row class="row ons-row-inner res_set0" id="set'+exercise_set.id+'" >';
							setcontent +='<ons-col class="col ons-col-inner"></ons-col>';
							setcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
							setcontent+='<select class="counterselect wselect wsetval'+exercise_set.id+'">';
							for (var i = 20; i <= 1200; i=i+5) {              
								setcontent+='<option value="'+i+'">'+i+'</option>';
							};
							setcontent+="</select></div></ons-col>";

							setcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
							setcontent+='<select class="counterselect rselect rsetval'+exercise_set.id+'">';
							for (var j = 1; j <= 150; j++) {
								setcontent+='<option value="'+j+'">'+j+'</option>';
							};
							setcontent+="</select></div></ons-col>";
							setcontent+='</ons-row></div>';           
							s++;
						}

						setcontent +='<a href="#" class="full blue" id="nextset" onclick="return SavesetNcont('+s_id+', \''+s_ids+'\')" style="margin:10px 18px;">Next</a>';
						*/

						// $('#exercise_set').html(content); 
						// $('#results').html(rcontent); 
						// $('#setsresults').html(setcontent);

						$('#exercise_set').html(content); 
						$('#results0').html(rcontent); 
						hideLoader();
						return; 
					})
				},dbError);
			})
		},dbError);
		hideLoader();
	},800);
}

function db_circuitExerciseDetails(id, ids){

	// alert(id);
	// alert(ids);

	if(window.localStorage.getItem('do_exercise') === '0'){
	 	db_circuitExerciseDetailsFuture(id, ids);
	 	return 0;
	}

	showLoader();
	setTimeout(function(){
		setUserFullName();
		ids = ids.split(',');    
		/*
		for (var i = 0; i <= ids.length; i++) {                          
			nxtlink="show_circuit_cooldownmodal('"+ids+"');";
			// ids[i]
		};
		*/

		for (var i = 0; i <= ids.length; i++) {                          
			if(id == ids[i]){
				if(ids[parseInt(i+1)]){        
					var nextid  = ids[parseInt(i+1)];
					nxtlink = "nextCircuit("+id+","+nextid+",'"+ids+"')";
				}else{
					nxtlink="show_circuit_cooldownmodal("+id+");";
				}

				if(ids[parseInt(i-1)]){        
					var backid  = ids[parseInt(i-1)];
					var backlink = "nextCircuit("+id+","+backid+",'"+ids+"')";
					// break;
				}else{
					var backlink = false;
				}
			}
		};

		// alert(nxtlink);

		var trid =  window.localStorage.getItem('userlogin');
		var exercise;
		var sqlite = 'SELECT `e`.`id`, `c`.`base64image` , `c`.`name` as circuit_name , `c`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" LEFT JOIN `circuit` as c ON `c`.`id` = `e`.`circuit_id` WHERE `c`.`id` = '+id;
		
		db.transaction(function(ltx) {
			ltx.executeSql(sqlite, [], function(ltx, exercise_results) {
				var exercise = exercise_results.rows.item(0);
				if(exercise.base64image != '' && exercise.base64image != '0'){
					$('#excerciseimage').attr('src', exercise.base64image);
					$('#excerciseimage')
						.load(function(){
							// alert('Image is loaded');
						})
						.error(function(){
							// alert('Image is not loaded');
							$('#excerciseimage').remove();
							$('#exercisedesc').css('padding-top', '50px');
						});
				}
				else{
					$('#excerciseimage').remove();
					$('#exercisedesc').css('padding-top', '50px');
				}

				if(exercise.wnotes != null)
					$("#workout_notes").val(exercise.wnotes);

				$('#exercisename').html(exercise.circuit_name);
				
				$('#exercisedesc').html(exercise.circuit_description);
				var rest_time = exercise.resttime;
				if(rest_time == "" || rest_time == "0"){
					$('#resttime').val('1');
				}else{
					$('#resttime').val(rest_time);
				}

				$('.returnhome').attr('onclick',"return returntohome("+exercise.workout_id+")"); 
				$("#workout_iddd").val(exercise.workout_id);

				// for (var i = 0; i <= ids.length; i++) {                          
				// 	if(ids[i] != undefined)
				// 		alert(ids[i]);
				// }
				
				var wheree = [];
				var eIds = [];
				var done = [];
				// for (var iii = 0; iii <= ids.length; iii++) {                          
				// 	if(ids[iii] != undefined){
				// 		wheree.push( ' `es`.`exercise_id` = '+ids[iii]+' ' );
				// 		eIds.push(ids[iii]);
				// 	}
				// }
				// wheree = wheree.join(' OR ');

				for(var row_number=0;row_number < exercise_results.rows.length; row_number++) {
					var exercis = exercise_results.rows.item(row_number);                         
					


					wheree.push( ' `es`.`exercise_id` = '+exercis.id+' ' );
					eIds.push(exercis.id);
				}
				wheree = wheree.join(' OR ');
				

				// for (var i = 0; i <= ids.length; i++) {                          
				// 	id = ids[i];
				// 	if(id != undefined){
						sqlite = 'SELECT `es`.`id`, `ex`.`name` as exname , `es`.`exercise_id`, `es`.`reps`, `es`.`time`, `es`.`value`, `esr`.`resultreps`, `esr`.`resultweight`, `esr`.`resulttime` FROM (`exercise_set` as es) LEFT JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id` AND `esr`.`trainee_id` = "'+trid+'" LEFT JOIN `exercise` as ex ON `ex`.`id` = `es`.`exercise_id` WHERE '+wheree+' ORDER BY `es`.`id` ASC';
						
						// alert(sqlite);

						db.transaction(function(ktx) {
							ktx.executeSql(sqlite, [], function(ktx, exercise_set_results) {
								


								var results = [];

								for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
									results.push(exercise_set_results.rows.item(row_number));
								}

								$.each ( eIds , function (iii,vv) {
									var arr = [];
									done.push(arr);
								});	



								$.each ( eIds , function (iii,vv) {
									$.each( results , function (ind , exercise_set) {
										if(parseInt(vv) == parseInt(exercise_set.exercise_id) ){
											done[iii].push( exercise_set );
										}
									} );

								});

								$.each( done, function( tt , pp ) {
									var i = 1;
									var j = 1;
									var content = "";

									content += '<ons-row class="lt row ons-row-inner" style="padding:10px 5px 15px 20px; margin-top: 10px ; color: #0091ae; background: #FFF;">';
									content += '<ons-col>'+ pp[0].exname +'</ons-col>';
									content += '</ons-row>';

									content += '<ons-row class="lt row ons-row-inner">';
									content +='<ons-col class="col ons-col-inner">Set</ons-col>';
									content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Time</ons-col>';            
									content +='</ons-row>';
									var len = pp.length;

									for(var row_number=0; row_number < len; row_number++) {
										var exercise_set = pp[row_number];
										content += '<ons-row class="row ons-row-inner">';
										content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
										
										var defaultweight = exercise_set.value;
										var defaultreps = exercise_set.reps;
										var defaulttime = exercise_set.time;

										if(defaultweight != 'Body Weight' && defaultweight != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
											
											if( exercise_set.resultweight == null ){
												content += '<i>'+exercise_set.value+'</i> lbs <img src="./images/up_down-arr.png" >'
											}
											else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) ){
												content += '<i class="red">'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
												defaultweight = exercise_set.resultweight;
											}
											else if( parseInt(exercise_set.resultweight) > parseInt(exercise_set.value) ){
												content += '<i class="green">'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
												defaultweight = exercise_set.resultweight;
											}
											else{
												content += '<i>'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
												defaultweight = exercise_set.resultweight;
											}

											content += '<select class="s_new_values">';
											for (var ii = 1; ii <= 1000; ii++) {
												var tset = '';
												if(ii == parseInt(exercise_set.value)){
													tset = 'Trainer set to : ';
												}

												if(parseInt(defaultweight) == ii )              
													content += '<option selected="selected" value="'+ii+'">'+tset+ii+'</option>';
												else
													content += '<option value="'+ii+'">'+tset+ii+'</option>';
											};
											content += '</select>';
											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
											
											if(defaultweight == 'Body Weight')
												content += '<i style="font-size:12px;">'+defaultweight+'</i>';
											else
												content += '<i>'+defaultweight+'</i>';
											

											content += '<select class="s_new_values" style="display:none;">';
											content += '<option selected="selected" value="'+defaultweight+'">Trainer set to : '+defaultweight+'</option>';
											content += '</select>';
											content += '</ons-col>';
										}


										if(defaultreps != 'Failure' && defaultreps != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
											
											if( exercise_set.resultreps == null ){
												content += '<i>'+exercise_set.reps+'</i> <img src="./images/up_down-arr.png" >'
											}
											else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) ){
												content += '<i class="red">'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
												defaultreps = exercise_set.resultreps;
											}
											else if( parseInt(exercise_set.resultreps) > parseInt(exercise_set.reps) ){
												content += '<i class="green">'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
												defaultreps = exercise_set.resultreps;
											}
											else{
												content += '<i>'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
												defaultreps = exercise_set.resultreps;
											}

											content += '<select class="s_new_values">';
											for (var jj = 1; jj <= 100; jj++) {
												var tset = '';
												if(jj == parseInt(exercise_set.reps)){
													tset = 'Trainer set to : ';
												}

												if(parseInt(defaultreps) == jj )              
													content += '<option selected="selected" value="'+jj+'">'+tset+jj+'</option>';
												else
													content += '<option value="'+jj+'">'+tset+jj+'</option>';
											};
											content += '</select>';
											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
											
											content += '<i>'+exercise_set.reps+'</i>';
											

											content += '<select class="s_new_values" style="display:none;">';
											content += '<option selected="selected" value="'+exercise_set.reps+'">Trainer set to : '+exercise_set.reps+'</option>';
											content += '</select>';
											content += '</ons-col>';
										}



										if(defaulttime != 'Failure' && defaulttime != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
											
											if( exercise_set.resulttime == null ){
												content += '<i>'+sec_to_min(exercise_set.time)+'</i> <img src="./images/up_down-arr.png" >'
											}
											else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) ){
												content += '<i class="red">'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
												defaulttime = exercise_set.resulttime;
											}
											else if( parseInt(exercise_set.resulttime) > parseInt(exercise_set.time) ){
												content += '<i class="green">'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
												defaulttime = exercise_set.resulttime;
											}
											else{
												content += '<i>'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
												defaulttime = exercise_set.resulttime;
											}

											content += '<select class="s_new_values">';
											for (var jj = 1; jj <= 900; jj++) {
												var tset = '';
												if(jj == parseInt(exercise_set.time)){
													tset = 'Trainer set to : ';
												}

												if(parseInt(defaulttime) == jj )              
													content += '<option selected="selected" value="'+jj+'">'+tset+sec_to_min(jj)+'</option>';
												else
													content += '<option value="'+jj+'">'+tset+sec_to_min(jj)+'</option>';
											};
											content += '</select>';
											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
											content += '<i>'+exercise_set.time+'</i>';
											

											content += '<select class="s_new_values" style="display:none;">';
											content += '<option selected="selected" value="'+exercise_set.time+'">Trainer set to : '+exercise_set.time+'</option>';
											content += '</select>';
											content += '</ons-col>';
										}


										content +='</ons-row>';
										j++;
									}





									var h = 1;
									rcontent = "";           
									for(var row_number=0; row_number < len; row_number++) {
										var exercise_set = pp[row_number];
										
										var defltweight = exercise_set.value;
										var defltreps = exercise_set.reps;
										var deflttime = exercise_set.time;

										if( exercise_set.resultweight == null ){
										}
										else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) ){
											defltweight = exercise_set.resultweight;
										}
										else{
											defltweight = exercise_set.resultweight;
										}

										if( exercise_set.resultreps == null ){
										}
										else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) ){
											defltreps = exercise_set.resultreps;
										}
										else{
											defltreps = exercise_set.resultreps;
										}

										if( exercise_set.resulttime == null ){
										}
										else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) ){
											deflttime = exercise_set.resulttime;
										}
										else{
											deflttime = exercise_set.resulttime;
										}

										rcontent +='<div class="bench pad_lt"><ons-row class="row ons-row-inner" ><ons-col class="col ons-col-inner">Set '+h+'</ons-col><ons-col class="col ons-col-inner">Weight</ons-col><ons-col class="col ons-col-inner">Reps</ons-col></ons-row></div>';
										rcontent +='<div class="results left"><ons-row class="row ons-row-inner res_set res_set_'+exercise_set.id+'" id="'+exercise_set.id+'" >';
										rcontent +='<ons-col class="col ons-col-inner"></ons-col>';
										
										if(exercise_set.value != 'Body Weight' && exercise_set.value != 'N/A'){
											rcontent +='<ons-col class="col ons-col-inner"><div class="counter">';
											rcontent +='<select class="counterselect wselect">';
											for (var ii = 1; ii <= 1000; ii++) {
												if(parseInt(defltweight) == ii )              
													rcontent += '<option selected="selected" value="'+ii+'">Trainer set to : '+ii+'</option>';
												else
													rcontent += '<option value="'+ii+'">'+ii+'</option>';
											};
											rcontent+="</select></div></ons-col>";
										}
										else{
											rcontent +='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
											rcontent +='<select class="counterselect wselect">';
											rcontent += '<option selected="selected" value="'+exercise_set.value+'">Trainer set to : '+exercise_set.value+'</option>';
											rcontent+="</select></div></ons-col>";
										}

										if(exercise_set.reps != 'Failure' && exercise_set.reps != 'N/A'){
											rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
											rcontent+='<select class="counterselect rselect">';
											for (var jj = 1; jj <= 100; jj++) {
												if(parseInt(defltreps) == jj )              
													rcontent += '<option selected="selected" value="'+jj+'">Trainer set to : '+jj+'</option>';
												else
													rcontent += '<option value="'+jj+'">'+jj+'</option>';
											};
											rcontent+="</select></div></ons-col>";
										}
										else{
											rcontent+='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
											rcontent+='<select class="counterselect rselect">';
											rcontent += '<option selected="selected" value="'+exercise_set.reps+'">Trainer set to : '+exercise_set.reps+'</option>';
											rcontent+="</select></div></ons-col>";
										}

										if(exercise_set.time != 'Failure' && exercise_set.time != 'N/A'){
											rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
											rcontent+='<select class="counterselect tselect">';
											for (var jj = 1; jj <= 900; jj++) {
												if(parseInt(deflttime) == jj )              
													rcontent += '<option selected="selected" value="'+jj+'">Trainer set to : '+sec_to_min(jj)+'</option>';
												else
													rcontent += '<option value="'+jj+'">'+sec_to_min(jj)+'</option>';
											};
											rcontent+="</select></div></ons-col>";
										}
										else{
											rcontent+='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
											rcontent+='<select class="counterselect tselect">';
											rcontent+='<option selected="selected" value="'+exercise_set.time+'">Trainer set to : '+exercise_set.time+'</option>';
											rcontent+="</select></div></ons-col>";
										}

										rcontent+='</ons-row></div>';
										h++;
									}

									$("#nxtt_btn").attr('onclick', nxtlink);
						
									if(backlink != false){
										$("#backk_btn").attr('onclick', backlink);
									}
									else{
										$("#backk_btn").css('background', '#cccccc');
									}

									// alert(nxtlink);

									$("div.notes_trainer.bench .lt").css('opacity', '0');
									$("div.notes_trainer.bench .notes_trainer_textarea").hide();
									
									content += '<input type="hidden" id="eIds" value="'+eIds.join(',')+'">';

									$('#exercise_set').append(content); 
									$('#results0').append(rcontent);

									hideLoader();
								} );

								return 0;


								var i = 1;
								var j = 1;
								var content = ""; 

								content += '<ons-row class="lt row ons-row-inner" style="padding:10px 5px 15px 20px; margin-top: 10px ; color: #0091ae; background: #FFF;">';
								content += '<ons-col>'+ exercise_set_results.rows.item(0).exname +'</ons-col>';
								content += '</ons-row>';

								content += '<ons-row class="lt row ons-row-inner">';
								content +='<ons-col class="col ons-col-inner">Set</ons-col>';
								content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
								content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
								content +='<ons-col class="col ons-col-inner">Time</ons-col>';            
								content +='</ons-row>';
								var len = exercise_set_results.rows.length;
			      

								for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
									var exercise_set = exercise_set_results.rows.item(row_number);
									content += '<ons-row class="row ons-row-inner">';
									content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
									
									var defaultweight = exercise_set.value;
									var defaultreps = exercise_set.reps;
									var defaulttime = exercise_set.time;

									if(defaultweight != 'Body Weight' && defaultweight != 'N/A'){
										content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
										content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
										
										if( exercise_set.resultweight == null ){
											content += '<i>'+exercise_set.value+'</i> lbs <img src="./images/up_down-arr.png" >'
										}
										else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) ){
											content += '<i class="red">'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
											defaultweight = exercise_set.resultweight;
										}
										else if( parseInt(exercise_set.resultweight) > parseInt(exercise_set.value) ){
											content += '<i class="green">'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
											defaultweight = exercise_set.resultweight;
										}
										else{
											content += '<i>'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
											defaultweight = exercise_set.resultweight;
										}

										content += '<select class="s_new_values">';
										for (var ii = 1; ii <= 1000; ii++) {
											var tset = '';
											if(ii == parseInt(exercise_set.value)){
												tset = 'Trainer set to : ';
											}

											if(parseInt(defaultweight) == ii )              
												content += '<option selected="selected" value="'+ii+'">'+tset+ii+'</option>';
											else
												content += '<option value="'+ii+'">'+tset+ii+'</option>';
										};
										content += '</select>';
										content += '</ons-col>';
									}
									else{
										content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
										content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
										
										if(defaultweight == 'Body Weight')
											content += '<i style="font-size:12px;">'+defaultweight+'</i>';
										else
											content += '<i>'+defaultweight+'</i>';
										

										content += '<select class="s_new_values" style="display:none;">';
										content += '<option selected="selected" value="'+defaultweight+'">Trainer set to : '+defaultweight+'</option>';
										content += '</select>';
										content += '</ons-col>';
									}


									if(defaultreps != 'Failure' && defaultreps != 'N/A'){
										content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
										content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
										
										if( exercise_set.resultreps == null ){
											content += '<i>'+exercise_set.reps+'</i> <img src="./images/up_down-arr.png" >'
										}
										else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) ){
											content += '<i class="red">'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
											defaultreps = exercise_set.resultreps;
										}
										else if( parseInt(exercise_set.resultreps) > parseInt(exercise_set.reps) ){
											content += '<i class="green">'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
											defaultreps = exercise_set.resultreps;
										}
										else{
											content += '<i>'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
											defaultreps = exercise_set.resultreps;
										}

										content += '<select class="s_new_values">';
										for (var jj = 1; jj <= 100; jj++) {
											var tset = '';
											if(jj == parseInt(exercise_set.reps)){
												tset = 'Trainer set to : ';
											}

											if(parseInt(defaultreps) == jj )              
												content += '<option selected="selected" value="'+jj+'">'+tset+jj+'</option>';
											else
												content += '<option value="'+jj+'">'+tset+jj+'</option>';
										};
										content += '</select>';
										content += '</ons-col>';
									}
									else{
										content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
										content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
										
										content += '<i>'+exercise_set.reps+'</i>';
										

										content += '<select class="s_new_values" style="display:none;">';
										content += '<option selected="selected" value="'+exercise_set.reps+'">Trainer set to : '+exercise_set.reps+'</option>';
										content += '</select>';
										content += '</ons-col>';
									}



									if(defaulttime != 'Failure' && defaulttime != 'N/A'){
										content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
										content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
										
										if( exercise_set.resulttime == null ){
											content += '<i>'+sec_to_min(exercise_set.time)+'</i> <img src="./images/up_down-arr.png" >'
										}
										else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) ){
											content += '<i class="red">'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
											defaulttime = exercise_set.resulttime;
										}
										else if( parseInt(exercise_set.resulttime) > parseInt(exercise_set.time) ){
											content += '<i class="green">'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
											defaulttime = exercise_set.resulttime;
										}
										else{
											content += '<i>'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
											defaulttime = exercise_set.resulttime;
										}

										content += '<select class="s_new_values">';
										for (var jj = 1; jj <= 900; jj++) {
											var tset = '';
											if(jj == parseInt(exercise_set.time)){
												tset = 'Trainer set to : ';
											}

											if(parseInt(defaulttime) == jj )              
												content += '<option selected="selected" value="'+jj+'">'+tset+sec_to_min(jj)+'</option>';
											else
												content += '<option value="'+jj+'">'+tset+sec_to_min(jj)+'</option>';
										};
										content += '</select>';
										content += '</ons-col>';
									}
									else{
										content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
										content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
										content += '<i>'+exercise_set.time+'</i>';
										

										content += '<select class="s_new_values" style="display:none;">';
										content += '<option selected="selected" value="'+exercise_set.time+'">Trainer set to : '+exercise_set.time+'</option>';
										content += '</select>';
										content += '</ons-col>';
									}


									content +='</ons-row>';
									j++;
								}

								var h = 1;
								rcontent = "";           
								for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
									var exercise_set = exercise_set_results.rows.item(row_number);
									
									var defltweight = exercise_set.value;
									var defltreps = exercise_set.reps;
									var deflttime = exercise_set.time;

									if( exercise_set.resultweight == null ){
									}
									else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) ){
										defltweight = exercise_set.resultweight;
									}
									else{
										defltweight = exercise_set.resultweight;
									}

									if( exercise_set.resultreps == null ){
									}
									else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) ){
										defltreps = exercise_set.resultreps;
									}
									else{
										defltreps = exercise_set.resultreps;
									}

									if( exercise_set.resulttime == null ){
									}
									else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) ){
										deflttime = exercise_set.resulttime;
									}
									else{
										deflttime = exercise_set.resulttime;
									}

									rcontent +='<div class="bench pad_lt"><ons-row class="row ons-row-inner" ><ons-col class="col ons-col-inner">Set '+h+'</ons-col><ons-col class="col ons-col-inner">Weight</ons-col><ons-col class="col ons-col-inner">Reps</ons-col></ons-row></div>';
									rcontent +='<div class="results left"><ons-row class="row ons-row-inner res_set res_set_'+exercise_set.id+'" id="'+exercise_set.id+'" >';
									rcontent +='<ons-col class="col ons-col-inner"></ons-col>';
									
									if(exercise_set.value != 'Body Weight' && exercise_set.value != 'N/A'){
										rcontent +='<ons-col class="col ons-col-inner"><div class="counter">';
										rcontent +='<select class="counterselect wselect">';
										for (var ii = 1; ii <= 1000; ii++) {
											if(parseInt(defltweight) == ii )              
												rcontent += '<option selected="selected" value="'+ii+'">Trainer set to : '+ii+'</option>';
											else
												rcontent += '<option value="'+ii+'">'+ii+'</option>';
										};
										rcontent+="</select></div></ons-col>";
									}
									else{
										rcontent +='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
										rcontent +='<select class="counterselect wselect">';
										rcontent += '<option selected="selected" value="'+exercise_set.value+'">Trainer set to : '+exercise_set.value+'</option>';
										rcontent+="</select></div></ons-col>";
									}

									if(exercise_set.reps != 'Failure' && exercise_set.reps != 'N/A'){
										rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
										rcontent+='<select class="counterselect rselect">';
										for (var jj = 1; jj <= 100; jj++) {
											if(parseInt(defltreps) == jj )              
												rcontent += '<option selected="selected" value="'+jj+'">Trainer set to : '+jj+'</option>';
											else
												rcontent += '<option value="'+jj+'">'+jj+'</option>';
										};
										rcontent+="</select></div></ons-col>";
									}
									else{
										rcontent+='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
										rcontent+='<select class="counterselect rselect">';
										rcontent += '<option selected="selected" value="'+exercise_set.reps+'">Trainer set to : '+exercise_set.reps+'</option>';
										rcontent+="</select></div></ons-col>";
									}

									if(exercise_set.time != 'Failure' && exercise_set.time != 'N/A'){
										rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
										rcontent+='<select class="counterselect tselect">';
										for (var jj = 1; jj <= 900; jj++) {
											if(parseInt(deflttime) == jj )              
												rcontent += '<option selected="selected" value="'+jj+'">Trainer set to : '+sec_to_min(jj)+'</option>';
											else
												rcontent += '<option value="'+jj+'">'+sec_to_min(jj)+'</option>';
										};
										rcontent+="</select></div></ons-col>";
									}
									else{
										rcontent+='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
										rcontent+='<select class="counterselect tselect">';
										rcontent+='<option selected="selected" value="'+exercise_set.time+'">Trainer set to : '+exercise_set.time+'</option>';
										rcontent+="</select></div></ons-col>";
									}

									rcontent+='</ons-row></div>';
									h++;
								}

								$("#backk_btn").remove();

								$("#nxtt_btn").css('width', '100%');
								$("#nxtt_btn").attr('onclick', nxtlink);

								$("div.notes_trainer.bench .lt").css('opacity', '0');
								$("div.notes_trainer.bench .notes_trainer_textarea").remove();
								$('#exercise_set').append(content); 
								$('#results0').append(rcontent);

								// hideLoader();
								return;

							})
						},dbError);
					// }
				// };
				
			})
		},dbError);
		hideLoader();
	},800);
}

function db_circuitOrExerciseDetails(id, ids){
	if(window.localStorage.getItem('do_exercise') === '0'){
	 	db_circuitOrExerciseDetailsFuture(id, ids);
	 	return 0;
	}

	showLoader();
	setTimeout(function(){
		setUserFullName();
		ids = ids.split(',');    
		/*
		for (var i = 0; i <= ids.length; i++) {                          
			nxtlink="show_circuit_cooldownmodal('"+ids+"');";
			// ids[i]
		};
		*/

		for (var i = 0; i <= ids.length; i++) {                          
			if(id == ids[i]){
				if(ids[parseInt(i+1)]){        
					var nextid  = ids[parseInt(i+1)];
					nxtlink = "nextCircuitOrExercise('"+id+"','"+nextid+"','"+ids+"')";
				}else{
					nxtlink="show_circuitOrExercise_cooldownmodal('"+id+"');";
				}

				if(ids[parseInt(i-1)]){        
					var backid  = ids[parseInt(i-1)];
					var backlink = "nextCircuitOrExercise('"+id+"','"+backid+"','"+ids+"')";
					// break;
				}else{
					var backlink = false;
				}
			}
		};

		// alert(nxtlink);

		var trid =  window.localStorage.getItem('userlogin');
		var exercise;
		
		var temp_id = id.split('_');

		if(temp_id[0] == 'circuit')
			var sqlite = 'SELECT `e`.`id`, `c`.`base64image` , `c`.`name` as circuit_name , `c`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" LEFT JOIN `circuit` as c ON `c`.`id` = `e`.`circuit_id` WHERE `c`.`id` = '+temp_id[1];
		else
			var sqlite = 'SELECT `e`.`id`, `e`.`base64image` , `e`.`name` as circuit_name , `e`.`description` as circuit_description  , `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated`, `wn`.`notes` as wnotes FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `e`.`workout_id` AND `wn`.`trainee_id` = "'+trid+'" WHERE `e`.`id` = '+temp_id[1];

		db.transaction(function(ltx) {
			ltx.executeSql(sqlite, [], function(ltx, exercise_results) {
				var exercise = exercise_results.rows.item(0);
				if(exercise.base64image != '' && exercise.base64image != '0'){
					$('#excerciseimage').attr('src', exercise.base64image);
					$('#excerciseimage')
						.load(function(){
							// alert('Image is loaded');
						})
						.error(function(){
							// alert('Image is not loaded');
							$('#excerciseimage').remove();
							$('#exercisedesc').css('padding-top', '50px');
						});
				}
				else{
					$('#excerciseimage').remove();
					$('#exercisedesc').css('padding-top', '50px');
				}

				if(exercise.wnotes != null)
					$("#workout_notes").val(exercise.wnotes);

				$('#exercisename').html(exercise.circuit_name);
				
				$('#exercisedesc').html(exercise.circuit_description);
				var rest_time = exercise.resttime;
				if(rest_time == "" || rest_time == "0"){
					$('#resttime').val('1');
				}else{
					$('#resttime').val(rest_time);
				}

				$('.returnhome').attr('onclick',"return returntohome("+exercise.workout_id+")"); 
				$("#workout_iddd").val(exercise.workout_id);

				// for (var i = 0; i <= ids.length; i++) {                          
				// 	if(ids[i] != undefined)
				// 		alert(ids[i]);
				// }
				
				var wheree = [];
				var eIds = [];
				var done = [];
				// for (var iii = 0; iii <= ids.length; iii++) {                          
				// 	if(ids[iii] != undefined){
				// 		wheree.push( ' `es`.`exercise_id` = '+ids[iii]+' ' );
				// 		eIds.push(ids[iii]);
				// 	}
				// }
				// wheree = wheree.join(' OR ');

				for(var row_number=0;row_number < exercise_results.rows.length; row_number++) {
					var exercis = exercise_results.rows.item(row_number);                         
					


					wheree.push( ' `es`.`exercise_id` = '+exercis.id+' ' );
					eIds.push(exercis.id);
				}
				wheree = wheree.join(' OR ');
				

				// for (var i = 0; i <= ids.length; i++) {                          
				// 	id = ids[i];
				// 	if(id != undefined){
						sqlite = 'SELECT `es`.`id`, `ex`.`name` as exname , `es`.`exercise_id`, `es`.`reps`, `es`.`time`, `es`.`value`, `esr`.`resultreps`, `esr`.`resultweight`, `esr`.`resulttime` FROM (`exercise_set` as es) LEFT JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id` AND `esr`.`trainee_id` = "'+trid+'" LEFT JOIN `exercise` as ex ON `ex`.`id` = `es`.`exercise_id` WHERE '+wheree+' ORDER BY `es`.`id` ASC';
						
						// alert(sqlite);

						db.transaction(function(ktx) {
							ktx.executeSql(sqlite, [], function(ktx, exercise_set_results) {
								


								var results = [];

								for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
									results.push(exercise_set_results.rows.item(row_number));
								}

								$.each ( eIds , function (iii,vv) {
									var arr = [];
									done.push(arr);
								});	



								$.each ( eIds , function (iii,vv) {
									$.each( results , function (ind , exercise_set) {
										if(parseInt(vv) == parseInt(exercise_set.exercise_id) ){
											done[iii].push( exercise_set );
										}
									} );

								});

								$.each( done, function( tt , pp ) {
									var i = 1;
									var j = 1;
									var content = "";

									if(temp_id[0] == 'circuit'){
										content += '<ons-row class="lt row ons-row-inner" style="padding:10px 5px 15px 20px; margin-top: 10px ; color: #0091ae; background: #FFF;">';
										content += '<ons-col>'+ pp[0].exname +'</ons-col>';
										content += '</ons-row>';
									}

									content += '<ons-row class="lt row ons-row-inner">';
									content +='<ons-col class="col ons-col-inner">Set</ons-col>';
									content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
									content +='<ons-col class="col ons-col-inner">Time</ons-col>';            
									content +='</ons-row>';
									var len = pp.length;

									for(var row_number=0; row_number < len; row_number++) {
										var exercise_set = pp[row_number];
										content += '<ons-row class="row ons-row-inner">';
										content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
										
										var defaultweight = exercise_set.value;
										var defaultreps = exercise_set.reps;
										var defaulttime = exercise_set.time;

										if(defaultweight != 'Body Weight' && defaultweight != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
											
											if( exercise_set.resultweight == null ){
												content += '<i>'+exercise_set.value+'</i> lbs <img src="./images/up_down-arr.png" >'
											}
											else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) ){
												content += '<i class="red">'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
												defaultweight = exercise_set.resultweight;
											}
											else if( parseInt(exercise_set.resultweight) > parseInt(exercise_set.value) ){
												content += '<i class="green">'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
												defaultweight = exercise_set.resultweight;
											}
											else{
												content += '<i>'+exercise_set.resultweight+'</i> lbs <img src="./images/up_down-arr.png" >'
												defaultweight = exercise_set.resultweight;
											}

											content += '<select class="s_new_values">';
											for (var ii = 1; ii <= 1000; ii++) {
												var tset = '';
												if(ii == parseInt(exercise_set.value)){
													tset = 'Trainer set to : ';
												}

												if(parseInt(defaultweight) == ii )              
													content += '<option selected="selected" value="'+ii+'">'+tset+ii+'</option>';
												else
													content += '<option value="'+ii+'">'+tset+ii+'</option>';
											};
											content += '</select>';
											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
											
											if(defaultweight == 'Body Weight')
												content += '<i style="font-size:12px;">'+defaultweight+'</i>';
											else
												content += '<i>'+defaultweight+'</i>';
											

											content += '<select class="s_new_values" style="display:none;">';
											content += '<option selected="selected" value="'+defaultweight+'">Trainer set to : '+defaultweight+'</option>';
											content += '</select>';
											content += '</ons-col>';
										}


										if(defaultreps != 'Failure' && defaultreps != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
											
											if( exercise_set.resultreps == null ){
												content += '<i>'+exercise_set.reps+'</i> <img src="./images/up_down-arr.png" >'
											}
											else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) ){
												content += '<i class="red">'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
												defaultreps = exercise_set.resultreps;
											}
											else if( parseInt(exercise_set.resultreps) > parseInt(exercise_set.reps) ){
												content += '<i class="green">'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
												defaultreps = exercise_set.resultreps;
											}
											else{
												content += '<i>'+exercise_set.resultreps+'</i> <img src="./images/up_down-arr.png" >';
												defaultreps = exercise_set.resultreps;
											}

											content += '<select class="s_new_values">';
											for (var jj = 1; jj <= 100; jj++) {
												var tset = '';
												if(jj == parseInt(exercise_set.reps)){
													tset = 'Trainer set to : ';
												}

												if(parseInt(defaultreps) == jj )              
													content += '<option selected="selected" value="'+jj+'">'+tset+jj+'</option>';
												else
													content += '<option value="'+jj+'">'+tset+jj+'</option>';
											};
											content += '</select>';
											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
											
											content += '<i>'+exercise_set.reps+'</i>';
											

											content += '<select class="s_new_values" style="display:none;">';
											content += '<option selected="selected" value="'+exercise_set.reps+'">Trainer set to : '+exercise_set.reps+'</option>';
											content += '</select>';
											content += '</ons-col>';
										}



										if(defaulttime != 'Failure' && defaulttime != 'N/A'){
											content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
											
											if( exercise_set.resulttime == null ){
												content += '<i>'+sec_to_min(exercise_set.time)+'</i> <img src="./images/up_down-arr.png" >'
											}
											else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) ){
												content += '<i class="red">'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
												defaulttime = exercise_set.resulttime;
											}
											else if( parseInt(exercise_set.resulttime) > parseInt(exercise_set.time) ){
												content += '<i class="green">'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
												defaulttime = exercise_set.resulttime;
											}
											else{
												content += '<i>'+sec_to_min(exercise_set.resulttime)+'</i> <img src="./images/up_down-arr.png" >';
												defaulttime = exercise_set.resulttime;
											}

											content += '<select class="s_new_values">';
											for (var jj = 1; jj <= 900; jj++) {
												var tset = '';
												if(jj == parseInt(exercise_set.time)){
													tset = 'Trainer set to : ';
												}

												if(parseInt(defaulttime) == jj )              
													content += '<option selected="selected" value="'+jj+'">'+tset+sec_to_min(jj)+'</option>';
												else
													content += '<option value="'+jj+'">'+tset+sec_to_min(jj)+'</option>';
											};
											content += '</select>';
											content += '</ons-col>';
										}
										else{
											content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
											content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
											content += '<i>'+exercise_set.time+'</i>';
											

											content += '<select class="s_new_values" style="display:none;">';
											content += '<option selected="selected" value="'+exercise_set.time+'">Trainer set to : '+exercise_set.time+'</option>';
											content += '</select>';
											content += '</ons-col>';
										}


										content +='</ons-row>';
										j++;
									}





									var h = 1;
									rcontent = "";           
									for(var row_number=0; row_number < len; row_number++) {
										var exercise_set = pp[row_number];
										
										var defltweight = exercise_set.value;
										var defltreps = exercise_set.reps;
										var deflttime = exercise_set.time;

										if( exercise_set.resultweight == null ){
										}
										else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) ){
											defltweight = exercise_set.resultweight;
										}
										else{
											defltweight = exercise_set.resultweight;
										}

										if( exercise_set.resultreps == null ){
										}
										else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) ){
											defltreps = exercise_set.resultreps;
										}
										else{
											defltreps = exercise_set.resultreps;
										}

										if( exercise_set.resulttime == null ){
										}
										else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) ){
											deflttime = exercise_set.resulttime;
										}
										else{
											deflttime = exercise_set.resulttime;
										}

										rcontent +='<div class="bench pad_lt"><ons-row class="row ons-row-inner" ><ons-col class="col ons-col-inner">Set '+h+'</ons-col><ons-col class="col ons-col-inner">Weight</ons-col><ons-col class="col ons-col-inner">Reps</ons-col></ons-row></div>';
										rcontent +='<div class="results left"><ons-row class="row ons-row-inner res_set res_set_'+exercise_set.id+'" id="'+exercise_set.id+'" >';
										rcontent +='<ons-col class="col ons-col-inner"></ons-col>';
										
										if(exercise_set.value != 'Body Weight' && exercise_set.value != 'N/A'){
											rcontent +='<ons-col class="col ons-col-inner"><div class="counter">';
											rcontent +='<select class="counterselect wselect">';
											for (var ii = 1; ii <= 1000; ii++) {
												if(parseInt(defltweight) == ii )              
													rcontent += '<option selected="selected" value="'+ii+'">Trainer set to : '+ii+'</option>';
												else
													rcontent += '<option value="'+ii+'">'+ii+'</option>';
											};
											rcontent+="</select></div></ons-col>";
										}
										else{
											rcontent +='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
											rcontent +='<select class="counterselect wselect">';
											rcontent += '<option selected="selected" value="'+exercise_set.value+'">Trainer set to : '+exercise_set.value+'</option>';
											rcontent+="</select></div></ons-col>";
										}

										if(exercise_set.reps != 'Failure' && exercise_set.reps != 'N/A'){
											rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
											rcontent+='<select class="counterselect rselect">';
											for (var jj = 1; jj <= 100; jj++) {
												if(parseInt(defltreps) == jj )              
													rcontent += '<option selected="selected" value="'+jj+'">Trainer set to : '+jj+'</option>';
												else
													rcontent += '<option value="'+jj+'">'+jj+'</option>';
											};
											rcontent+="</select></div></ons-col>";
										}
										else{
											rcontent+='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
											rcontent+='<select class="counterselect rselect">';
											rcontent += '<option selected="selected" value="'+exercise_set.reps+'">Trainer set to : '+exercise_set.reps+'</option>';
											rcontent+="</select></div></ons-col>";
										}

										if(exercise_set.time != 'Failure' && exercise_set.time != 'N/A'){
											rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
											rcontent+='<select class="counterselect tselect">';
											for (var jj = 1; jj <= 900; jj++) {
												if(parseInt(deflttime) == jj )              
													rcontent += '<option selected="selected" value="'+jj+'">Trainer set to : '+sec_to_min(jj)+'</option>';
												else
													rcontent += '<option value="'+jj+'">'+sec_to_min(jj)+'</option>';
											};
											rcontent+="</select></div></ons-col>";
										}
										else{
											rcontent+='<ons-col class="col ons-col-inner"><div style="display:none;" class="counter">';
											rcontent+='<select class="counterselect tselect">';
											rcontent+='<option selected="selected" value="'+exercise_set.time+'">Trainer set to : '+exercise_set.time+'</option>';
											rcontent+="</select></div></ons-col>";
										}

										rcontent+='</ons-row></div>';
										h++;
									}

									$("#nxtt_btn").attr('onclick', nxtlink);
						
									if(backlink != false){
										$("#backk_btn").attr('onclick', backlink);
									}
									else{
										$("#backk_btn").css('background', '#cccccc');
									}

									// alert(nxtlink);

									$("div.notes_trainer.bench .lt").css('opacity', '0');
									$("div.notes_trainer.bench .notes_trainer_textarea").hide();
									
									content += '<input type="hidden" id="eIds" value="'+eIds.join(',')+'">';

									$('#exercise_set').append(content); 
									$('#results0').append(rcontent);

									hideLoader();
								} );
									
							})
						},dbError);
					// }
				// };
				
			})
		},dbError);
		hideLoader();
	},800);
}

function db_oldEexerciseDetails(id, ids){
	showLoader();
	setTimeout(function(){
		setUserFullName();
		ids = ids.split(',');    
		for (var i = 0; i <= ids.length; i++) {                          
			if(id == ids[i]){
				if(ids[parseInt(i+1)]){        
					var nextid  = ids[parseInt(i+1)];
					nxtlink = "OldNextexercise("+id+","+nextid+",'"+ids+"')";
					// break;
				}else{
					nxtlink = false;
				}

				if(ids[parseInt(i-1)]){        
					var backid  = ids[parseInt(i-1)];
					var backlink = "OldBackexercise("+id+","+backid+",'"+ids+"')";
					// break;
				}else{
					var backlink = false;
				}
			}
		};

		var trid =  window.localStorage.getItem('userlogin');

		var exercise;
		var sqlite = 'SELECT `e`.`id`, `e`.`base64image`, `en`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `e`.`status`, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated` FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+trid+'" WHERE `e`.`id` = '+id;
		db.transaction(function(ltx) {
			ltx.executeSql(sqlite, [], function(ltx, exercise_results) {
				var exercise = exercise_results.rows.item(0);
				
				// sqlite = 'SELECT * FROM exercise_set where exercise_id = '+id+' ORDER BY id ASC';

				sqlite = 'SELECT `es`.`id`, `es`.`exercise_id`, `es`.`reps`, `es`.`time`, `es`.`value`, `esr`.`resultreps`, `esr`.`resulttime`, `esr`.`resultweight` FROM (`exercise_set` as es) LEFT JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id` AND `esr`.`trainee_id` = "'+trid+'" WHERE `es`.`exercise_id` = '+id+' ORDER BY `es`.`id` ASC';

				db.transaction(function(ktx) {
					ktx.executeSql(sqlite, [], function(ktx, exercise_set_results) {
						if(exercise.base64image != '' && exercise.base64image != '0'){
							$('#excerciseimage').attr('src', exercise.base64image);
							$('#excerciseimage')
								.load(function(){
									// alert('Image is loaded');
								})
								.error(function(){
									// alert('Image is not loaded');
									$('#excerciseimage').remove();
									$('#exercisedesc').css('padding-top', '50px');
								});
						}
						else{
							// $('#excerciseimage').attr('src', no_image);
							$('#excerciseimage').remove();
							$('#exercisedesc').css('padding-top', '50px');
						}

						if(exercise.notes == null)
							$("#exercise_notes").html( 'Notes to Trainer : ');
						else
							$("#exercise_notes").html( 'Notes to Trainer : <br> ' + exercise.notes);

						$('#exercisename').html(exercise.name);
						$('#exercisedesc').html(exercise.description);
						var rest_time = exercise.resttime;
						if(rest_time == "" || rest_time == "0"){
							$('#resttime').val('1');
						}else{
							$('#resttime').val(rest_time);
						}
						
						$('.returnhome').attr('onclick',"return oldreturntohome("+exercise.workout_id+")");          
						var i = 1;
						var j = 1;
						var content = "";          
						//alert(res.success.set.length);
						content += '<ons-row class="lt row ons-row-inner">';
						content +='<ons-col class="col ons-col-inner">Set</ons-col>';
						content +='<ons-col class="col ons-col-inner">Weight</ons-col>';            
						content +='<ons-col class="col ons-col-inner">Reps</ons-col>';            
						content +='<ons-col class="col ons-col-inner">Time</ons-col>';            
						content +='</ons-row>';
						var len = exercise_set_results.rows.length;
	      

						for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
							var exercise_set = exercise_set_results.rows.item(row_number);
							content += '<ons-row class="row ons-row-inner">';
							content +='<ons-col class="col ons-col-inner"><i>'+j+'</i> of <i>'+len+'</i></ons-col>';
							
							// content +='<ons-col class="col ons-col-inner"><i>'+exercise_set.value+'</i></ons-col>';            
							// content +='<ons-col class="col ons-col-inner"><i>'+exercise_set.reps+'</i></ons-col>';            
							
							if(exercise_set.value != 'Body Weight' && exercise_set.value != 'N/A'){
								content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
								
								if( exercise_set.resultweight == null )
									content += '<i class="red">'+'0'+'</i> lbs'
								else if( parseInt(exercise_set.resultweight) < parseInt(exercise_set.value) )
									content += '<i class="red">'+exercise_set.resultweight+'</i> lbs'
								else if( parseInt(exercise_set.resultweight) > parseInt(exercise_set.value) )
									content += '<i class="green">'+exercise_set.resultweight+'</i> lbs'
								else
									content += '<i>'+exercise_set.resultweight+'</i> lbs'
								
								content += '</ons-col>';
							}
							else{
								content += '<ons-col class="col ons-col-inner" id="w_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.value+'">';
								
								if(exercise_set.value == 'Body Weight')
									content += '<i style="font-size:12px;">'+exercise_set.value+'</i>'
								else
									content += '<i>'+exercise_set.value+'</i>'
								
								content += '</ons-col>';
							}



							if(exercise_set.reps != 'Failure' && exercise_set.reps != 'N/A'){
								content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
								
								// content += '<i>'+exercise_set.reps+'</i>'

								if( exercise_set.resultreps == null )
									content += '<i class="red">'+'0'+'</i>'
								else if( parseInt(exercise_set.resultreps) < parseInt(exercise_set.reps) )
									content += '<i class="red">'+exercise_set.resultreps+'</i>'
								else if( parseInt(exercise_set.resultreps) > parseInt(exercise_set.reps) )
									content += '<i class="green">'+exercise_set.resultreps+'</i>'
								else
									content += '<i>'+exercise_set.resultreps+'</i>'
								

								content += '</ons-col>';
							}
							else{
								content += '<ons-col class="col ons-col-inner" id="r_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.reps+'">';
								
								content += '<i>'+exercise_set.reps+'</i>'
								

								content += '</ons-col>';
							}

							if(exercise_set.time != '' && exercise_set.time != 'Failure' && exercise_set.time != 'N/A'){
								content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
								
								// content += '<i>'+exercise_set.reps+'</i>'

								if( exercise_set.resulttime == null )
									content += '<i class="red">'+'0s'+'</i>'
								else if( parseInt(exercise_set.resulttime) < parseInt(exercise_set.time) )
									content += '<i class="red">'+sec_to_min(exercise_set.resulttime)+'</i>'
								else if( parseInt(exercise_set.resulttime) > parseInt(exercise_set.time) )
									content += '<i class="green">'+sec_to_min(exercise_set.resulttime)+'</i>'
								else
									content += '<i>'+sec_to_min(exercise_set.resulttime)+'</i>'
								

								content += '</ons-col>';
							}
							else{
								content += '<ons-col class="col ons-col-inner" id="t_'+exercise_set.id+'">';
								content += '<input type="hidden" class="original_value" value="'+exercise_set.time+'">';
								
								if(exercise_set.time == '')
									content += '<i>N/A</i>'
								else	
									content += '<i>'+exercise_set.time+'</i>'
								

								content += '</ons-col>';
							}

							content += '</ons-row>';
							j++;
						}

						var h = 1;
						rcontent = "";           
						// rcontent += '<div class="success"><p>Success!</p><h3>You finished this round!</h3></div><div class="results left"><h4>Results</h4></div>';

						for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
							var exercise_set = exercise_set_results.rows.item(row_number);
							
							rcontent +='<div class="bench pad_lt"><ons-row class="row ons-row-inner" ><ons-col class="col ons-col-inner">Set '+h+'</ons-col><ons-col class="col ons-col-inner">Weight</ons-col><ons-col class="col ons-col-inner">Reps</ons-col></ons-row></div>';
							rcontent +='<div class="results left"><ons-row class="row ons-row-inner res_set res_set_'+exercise_set.id+'" id="'+exercise_set.id+'" >';
							rcontent +='<ons-col class="col ons-col-inner"></ons-col>';
							rcontent +='<ons-col class="col ons-col-inner"><div class="counter">';
							rcontent +='<select class="counterselect wselect">';
							for (var ii = 1; ii <= 1000; ii++) {
								if(parseInt(exercise_set.value) == ii )              
									rcontent += '<option selected="selected" value="'+ii+'">'+ii+'</option>';
								else
									rcontent += '<option value="'+ii+'">'+ii+'</option>';
							};
							rcontent+="</select></div></ons-col>";

							rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
							rcontent+='<select class="counterselect rselect">';
							for (var jj = 1; jj <= 100; jj++) {
								if(parseInt(exercise_set.reps) == jj )              
									rcontent += '<option selected="selected" value="'+jj+'">'+jj+'</option>';
								else
									rcontent += '<option value="'+jj+'">'+jj+'</option>';
							};
							rcontent+="</select></div></ons-col>";

							rcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
							rcontent+='<select class="counterselect tselect">';
							for (var jj = 1; jj <= 1000; jj++) {
								if(parseInt(exercise_set.time) == jj )              
									rcontent += '<option selected="selected" value="'+jj+'">'+jj+'</option>';
								else
									rcontent += '<option value="'+jj+'">'+jj+'</option>';
							};
							rcontent+="</select></div></ons-col>";


							rcontent+='</ons-row></div>';
							h++;
						}

						// rcontent +='<a href="#" class="full blue" onclick="return '+nxtlink+'" style="margin:10px 18px;">Next</a>';
						if(nxtlink != false){
							$("#nxtt_btn").attr('onclick', nxtlink);
						}
						else{
							$("#nxtt_btn").html('Done');
							$("#nxtt_btn").attr('onclick',"return oldreturntohome("+exercise.workout_id+")");
						}
						
						if(backlink != false){
							$("#backk_btn").attr('onclick', backlink);
						}
						else{
							$("#backk_btn").css('background', '#cccccc');
						}

						var s_ids="";
						var o = 1;
						var s_id = "";

						for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
							var exercise_set = exercise_set_results.rows.item(row_number);
							if(o == 1){
								s_id = exercise_set.id;
							}

							if(o !=1){
								s_ids += ',';
							}

							s_ids +=exercise_set.id;
							o++;
						}

						var s = 1;

						setcontent = "";           
						/*
						setcontent += '<div class="success"><p>Success!</p><h3>You finished this round!</h3></div><div class="results left"><h4>Results</h4></div>';           

						for(var row_number=0;row_number < exercise_set_results.rows.length; row_number++) {
							var exercise_set = exercise_set_results.rows.item(row_number);
							if(s==1){
								$('.setone').attr('onclick','return showsetmodalbox('+exercise_set.id+', \''+s_ids+'\',"YES")');
							}

							setcontent += '<div class="bench pad_lt hideset set'+exercise_set.id+'"><ons-row class="row ons-row-inner" ><ons-col class="col ons-col-inner">Set '+s+'</ons-col><ons-col class="col ons-col-inner">Weight</ons-col><ons-col class="col ons-col-inner">Reps</ons-col></ons-row></div>';
							setcontent +='<div class="results left hideset set'+exercise_set.id+'"><ons-row class="row ons-row-inner res_set0" id="set'+exercise_set.id+'" >';
							setcontent +='<ons-col class="col ons-col-inner"></ons-col>';
							setcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
							setcontent+='<select class="counterselect wselect wsetval'+exercise_set.id+'">';
							for (var i = 20; i <= 1200; i=i+5) {              
								setcontent+='<option value="'+i+'">'+i+'</option>';
							};
							setcontent+="</select></div></ons-col>";

							setcontent+='<ons-col class="col ons-col-inner"><div class="counter">';
							setcontent+='<select class="counterselect rselect rsetval'+exercise_set.id+'">';
							for (var j = 1; j <= 150; j++) {
								setcontent+='<option value="'+j+'">'+j+'</option>';
							};
							setcontent+="</select></div></ons-col>";
							setcontent+='</ons-row></div>';           
							s++;
						}

						setcontent +='<a href="#" class="full blue" id="nextset" onclick="return SavesetNcont('+s_id+', \''+s_ids+'\')" style="margin:10px 18px;">Next</a>';
						*/

						// $('#exercise_set').html(content); 
						// $('#results').html(rcontent); 
						// $('#setsresults').html(setcontent);

						$('#exercise_set').html(content); 
						$('#results0').html(rcontent); 
						hideLoader();
						return; 
					})
				},dbError);
			})
		},dbError);
		hideLoader();
	},800);
}

function db_showsetendtime(sid,s_ids){
	stopcountdown();
	var min = $('#resttime').val();
	if(min !=""){
		min = parseInt(min);
		var currdate = new Date();
		var at = currdate.setMinutes(currdate.getMinutes() + min);      
		console.log(new Date(at));
		$('.timer0').countdown({until: new Date(at),format: 'MS',layout: '{mnn}{sep}{snn}', onExpiry:stopcountdown});
	}

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
				break;
			}else{
				nsetlink = 'showRmodalbox()';   
				nxtset = "showsetendtime("+s_ids[0]+",'"+s_ids+"','YES')";       
				$('#nextset').attr('onclick',nxtset) ;
				break;         
			}
		}
	};

    $('#setmodalbox').hide();
	$('#setendtimebox').show();
	$('#tabbarbtm').hide();
	$('#hideonmodal').hide();
	$('.navigation-bar').css('z-index',0);
	$('#nextsetGO').attr('onclick',nsetlink);
	$('#nextsetskip').attr('onclick',nsetlink);
	$('.block').css('z-index',9999);  
  
	var we = $('.set'+sid).find('.wsetval'+sid).val();
	var re = $('.set'+sid).find('.rsetval'+sid).val();
	$('#'+sid).find('.wselect').val(we);
	$('#'+sid).find('.rselect').val(re);

	db.transaction(function(utx) {
		var lastupdated = get_timestamp();
		utx.executeSql("update exercise_set set resultreps = ? , resultweight = ? , timetaken = ? , set_status = ? , lastupdated = ? where id = ?", [re, we, 0, 1, lastupdated, sid]);
		if(isOnline()){
			$.ajax({
				type:'POST',
				url : apiUrl, 
				data: {
					'timetake' : 0,
					'setid' : sid,
					'weight' : we,
					'reps' : re,
					'lastupdated' : lastupdated,
					'method' : 'db_update_setntime'
				}    
			});
		}
	},dbError);
}

function db_Nextexercise(id, nextid, ids){
	var trainee_id = window.localStorage.getItem("userlogin");
	stopcountdown();
	var lastupdated = get_timestamp();
	var istimer = $('#istime').val();
	if(istimer == 1){
		hideRbox();    
		showendtime(nextid,ids);

		var tim = $('.timer').html();
		var n = tim.indexOf(":");
		if(parseInt(n) == -1){
			tim = "00:"+tim; 
		}

		db.transaction(function(utx) {
			utx.executeSql("update exercise set timetaken = ? , lastupdated = ? where id = ?", [tim, lastupdated, id]);
			if(isOnline()){
				$.ajax({
					type:'POST',
					url : apiUrl, 
					data: {
						'timetake' : tim,
						'eid' : id,
						'lastupdated' : lastupdated,
						'method' : 'db_update_timetaken'
					}    
				});
			}
		},dbError);
	}

	// setTimeout(function(){
		var arr = [];
		$('.res_set').each(function(){
			var tokennn = get_token();
			var updateid   = $(this).attr('id');
			var updateweight   = $(this).find('.wselect').val();
			var updatereps = $(this).find('.rselect').val();
			var updatetime = $(this).find('.tselect').val();
			arr.push({
				id:updateid,
				weight:updateweight,
				reps:updatereps,
				time:updatetime,
				token:tokennn
			});

			db.transaction(function(ptx) {
				ptx.executeSql("update exercise_set set resultweight = ? , resultreps = ? , set_status = ? , lastupdated = ? where id = ?", [updateweight, updatereps, 1, lastupdated, updateid]);
			},dbError);

			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_set_results where ( exercise_set_id = '"+updateid+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_set_id = '"+updateid+".0' and trainee_id = '"+trainee_id+"' )  ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_set_results(exercise_set_id, resultweight, resultreps, lastupdated, resulttime, token , trainee_id ) values(?,?,?,?,?,?,?)", [updateid, updateweight, updatereps, lastupdated, updatetime,tokennn, trainee_id]);
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_set_results set resultweight = ? , resultreps = ? , lastupdated = ? , resulttime = ? where id = ?", [updateweight, updatereps, lastupdated, updatetime,row.id]);
					}
				});
			});

		});

		if(isOnline()){
			$.ajax({
				type:'POST',
				url : apiUrl, 
				data: {
					'updatearr' : arr,
					'lastupdated' : lastupdated,
					'trainee_id' : trainee_id,
					'method' : 'db_update_exercise_set'
				}    
			});
		}

		// $.ajax({
		// 	method : 'POST',
		// 	url : apiUrl, 
		// 	data: {updatearr:arr, method:'update_exercise_set'},            
		// })

		var note = $('#exercise_notes').val();

		var tokennnn = get_token();

		db.transaction(function(ttx) {
			ttx.executeSql("update exercise set status = ? , notes = ? , lastupdated = ? where id = ?", [1, note, lastupdated, id]);
			
			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_notes where ( exercise_id = '"+id+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_id = '"+id+".0' and trainee_id = '"+trainee_id+"' )  ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_notes(exercise_id, trainee_id, notes, lastupdated , token ) values(?,?,?,?,?)", [id, trainee_id, note, lastupdated, tokennnn]);

						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : tokennnn,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_notes set notes = ? , lastupdated = ? where id = ?", [note, lastupdated, row.id]);

						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : row.token,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
				});
			});

			
		},dbError);

		// $.ajax({
		// 	type:'POST',
		// 	url : apiUrl, 
		// 	data: {id:id,note:note, method:'update_exercise'},    
		// });
    
		if(istimer != 1){
			exerciseDetails(nextid,ids);      
		} 

	// }, 10)
}

function db_OldNextexercise(id, nextid, ids){
	oldExerciseDetails(nextid,ids); 
}

function OldBackexercise(id, backid, ids){
	oldExerciseDetails(backid,ids);
}

function oldNextCircuit(id, nextid, ids){
	oldCircuitExerciseDetails(nextid,ids);
}

function oldNextCircuitOrExercise(id, nextid, ids){
	oldCircuitOrExerciseDetails(nextid,ids);
}

function nextFutureCircuit(id, nextid, ids){
	circuitExerciseDetailsFuture(nextid,ids);
}

function nextFutureCircuitOrExercise(id, nextid, ids){
	circuitOrExerciseDetailsFuture(nextid,ids);
}

function Backexercise(id, backid, ids){
	var trainee_id = window.localStorage.getItem("userlogin");
	stopcountdown();
	var lastupdated = get_timestamp();
	var istimer = $('#istime').val();
	if(istimer == 1){
		hideRbox();    
		showendtime(backid,ids);

		var tim = $('.timer').html();
		var n = tim.indexOf(":");
		if(parseInt(n) == -1){
			tim = "00:"+tim; 
		}

		db.transaction(function(utx) {
			utx.executeSql("update exercise set timetaken = ? , lastupdated = ? where id = ?", [tim, lastupdated, id]);
			if(isOnline()){
				$.ajax({
					type:'POST',
					url : apiUrl, 
					data: {
						'timetake' : tim,
						'eid' : id,
						'lastupdated' : lastupdated,
						'method' : 'db_update_timetaken'
					}    
				});
			}
		},dbError);
	}

	// setTimeout(function(){
		var arr = [];
		$('.res_set').each(function(){
			var tokennn = get_token();
			var updateid   = $(this).attr('id');
			var updateweight   = $(this).find('.wselect').val();
			var updatereps = $(this).find('.rselect').val();
			var updatetime = $(this).find('.tselect').val();
			arr.push({
				id:updateid,
				weight:updateweight,
				reps:updatereps,
				time:updatetime,
				token:tokennn
			});

			db.transaction(function(ptx) {
				ptx.executeSql("update exercise_set set resultweight = ? , resultreps = ? , set_status = ? , lastupdated = ? where id = ?", [updateweight, updatereps, 1, lastupdated, updateid]);
			},dbError);

			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_set_results where ( exercise_set_id = '"+updateid+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_set_id = '"+updateid+".0' and trainee_id = '"+trainee_id+"' )  ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_set_results(exercise_set_id, resultweight, resultreps, lastupdated, resulttime, token , trainee_id ) values(?,?,?,?,?,?,?)", [updateid, updateweight, updatereps, lastupdated, updatetime,tokennn, trainee_id]);
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_set_results set resultweight = ? , resultreps = ? , lastupdated = ? , resulttime = ? where id = ?", [updateweight, updatereps, lastupdated, updatetime,row.id]);
					}
				});
			});

		});

		if(isOnline()){
			$.ajax({
				type:'POST',
				url : apiUrl, 
				data: {
					'updatearr' : arr,
					'lastupdated' : lastupdated,
					'trainee_id' : trainee_id,
					'method' : 'db_update_exercise_set'
				}    
			});
		}

		// $.ajax({
		// 	method : 'POST',
		// 	url : apiUrl, 
		// 	data: {updatearr:arr, method:'update_exercise_set'},            
		// })

		var note = $('#exercise_notes').val();

		var tokennnn = get_token();

		db.transaction(function(ttx) {
			ttx.executeSql("update exercise set status = ? , notes = ? , lastupdated = ? where id = ?", [1, note, lastupdated, id]);
			
			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_notes where ( exercise_id = '"+id+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_id = '"+id+".0' and trainee_id = '"+trainee_id+"' )  ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_notes(exercise_id, trainee_id, notes, lastupdated , token ) values(?,?,?,?,?)", [id, trainee_id, note, lastupdated, tokennnn]);

						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : tokennnn,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}

					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_notes set notes = ? , lastupdated = ? where id = ?", [note, lastupdated, row.id]);

						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : row.token,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
				});
			});

			
		},dbError);

		// $.ajax({
		// 	type:'POST',
		// 	url : apiUrl, 
		// 	data: {id:id,note:note, method:'update_exercise'},    
		// });
    
		if(istimer != 1){
			exerciseDetails(backid,ids);      
		} 

	// }, 10)
}

function db_show_cooldownmodal(id){
	var trainee_id = window.localStorage.getItem("userlogin");
	stopcountdown();
	var lastupdated = get_timestamp();
	var min = $('#resttime').val();
	if(min !=""){
		min = parseInt(min);
		var currdate = new Date();
		var at = currdate.setMinutes(currdate.getMinutes() + min);      
		$('.timer0').countdown({until: new Date(at),format: 'MS',layout: '{mnn}{sep}{snn}', onExpiry:stopcountdown});
	}

	// setTimeout(function(){
		var arr = [];
		$('.res_set').each(function(){
			var tokennn = get_token();
			var updateid   = $(this).attr('id');
			var updateweight   = $(this).find('.wselect').val();
			var updatereps = $(this).find('.rselect').val();
			var updatetime = $(this).find('.tselect').val();
			arr.push({
				id:updateid,
				weight:updateweight,
				reps:updatereps,
				time:updatetime,
				token:tokennn
			});

			db.transaction(function(ptx) {
				ptx.executeSql("update exercise_set set resultweight = ? , resultreps = ? , set_status = ? , lastupdated = ? where id = ?", [updateweight, updatereps, 1, lastupdated, updateid]);
			},dbError);

			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_set_results where ( exercise_set_id = '"+updateid+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_set_id = '"+updateid+".0' and trainee_id = '"+trainee_id+"' )  ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_set_results(exercise_set_id, resultweight, resultreps, lastupdated, resulttime, token , trainee_id ) values(?,?,?,?,?,?,?)", [updateid, updateweight, updatereps, lastupdated, updatetime,tokennn, trainee_id]);
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_set_results set resultweight = ? , resultreps = ? , lastupdated = ? , resulttime = ? where id = ?", [updateweight, updatereps, lastupdated, updatetime,row.id]);
					}
				});
			});
		});

		if(isOnline()){
			$.ajax({
				type:'POST',
				url : apiUrl, 
				data: {
					'updatearr' : arr,
					'lastupdated' : lastupdated,
					'trainee_id' : trainee_id,
					'method' : 'db_update_exercise_set'
				}    
			});
		}
		
		// $.ajax({
		// 	method : 'POST',
		// 	url : apiUrl, 
		// 	data: {updatearr:arr, method:'update_exercise_set'},            
		// })

		var note = $('#exercise_notes').val();

		var tokennnn = get_token();

		db.transaction(function(ttx) {
			ttx.executeSql("update exercise set status = ? , notes = ? , lastupdated = ? where id = ?", [1, note, get_timestamp(), id]);
			
			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_notes where ( exercise_id = '"+id+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_id = '"+id+".0' and trainee_id = '"+trainee_id+"' ) ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_notes(exercise_id, trainee_id, notes, lastupdated , token ) values(?,?,?,?,?)", [id, trainee_id, note, lastupdated, tokennnn]);

						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : tokennnn,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_notes set notes = ? , lastupdated = ? where id = ?", [note, lastupdated, row.id]);

						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : row.token,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
				});
			});

						
		},dbError);

		// $.ajax({
		// 	type:'POST',
		// 	url : apiUrl, 
		// 	data: {id:id,note:note, method:'update_exercise'},    
		// });
   
		$('#hideonmodal').hide();
		$('#modalbox').hide();   
		$('#Rmodalbox').hide();
		// $('#cooldownmodal').show();
		$('#tabbarbtm').hide();
		$('.navigation-bar').css('z-index',0);
		$('.block').css('z-index',9999); 

		var wid = $("#workout_iddd").val();

		// alert(wid);

		var sq_query = "SELECT * FROM (`exercise`) WHERE `workout_id` =  '"+wid+"'";

		db.transaction(function(tx) {
			tx.executeSql(sq_query, [], function(tx, results) {
				var exercise_ids = [];
				var eiddd;
				
				for(var i=0; i<results.rows.length; i++) {
					eiddd = results.rows.item(i).id;
					exercise_ids.push(' exercise_id = ' + eiddd + ' ');
				}

				var where = '';

				if(exercise_ids.length > 0){
					where = exercise_ids.join(' OR ');
				}
				else{
					db_returntohome(wid);
					return 0;
				}

				if(where != ''){
					where = 'where '+where;
				}

				db.transaction(function(ctx) {
					ctx.executeSql("select * from exercise_set "+where, [], function(ctx, resultss) {

						var exercise_set_ids = []; 
						var e_set_id;

						for(var i=0; i<resultss.rows.length; i++) {
							e_set_id = resultss.rows.item(i).id;
							exercise_set_ids.push(e_set_id);
						}

						where = '';

						if(exercise_set_ids.length > 0){
							where = exercise_set_ids.join(' OR ');
						}
						else{
							db_returntohome(wid);
							return 0;
						}

						if(where != ''){
							where = 'where '+where;
						}

						sq_query = "SELECT `esr`.`id`, `es`.`value`, `esr`.`resultweight`, `es`.`time`, `esr`.`resulttime`, `es`.`reps`, `esr`.`resultreps` FROM (`exercise_set` as es) JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id`";

						sq_query += " WHERE `es`.`id` IN ( "+exercise_set_ids.join(' , ')+" ) ";

						sq_query += " AND `esr`.`trainee_id` =  '"+trainee_id+"' ";

						db.transaction(function(ptx) {
							ptx.executeSql(sq_query, [], function(ctx, resultsss) {

								if(resultsss.rows.length == resultss.rows.length){

									var flaggg = true;

									for(var i=0; i<resultsss.rows.length; i++) {

										var row = resultsss.rows.item(i);

										if( (row.value != row.resultweight) || (row.time != row.resulttime) || (row.reps != row.resultreps) ){
											flaggg = false;
										}

									}

									if(flaggg){
										show_finishedmodal();
										return 0;
									}
									else{
										db_returntohome(wid);
										return 0;
									}
								
								}
								else{
									db_returntohome(wid);
									return 0;
								}

							})
						});
					})
				});
			})
		});

		// db_returntohome(wid);

		// show_finishedmodal();
  


  // }, 10)
}

function nextCircuit(id, nextid, ids){
	var trainee_id = window.localStorage.getItem("userlogin");
	var lastupdated = get_timestamp();
	var min = $('#resttime').val();

	var arr = [];
	$('.res_set').each(function(){
		var tokennn = get_token();
		var updateid   = $(this).attr('id');
		var updateweight   = $(this).find('.wselect').val();
		var updatereps = $(this).find('.rselect').val();
		var updatetime = $(this).find('.tselect').val();
		arr.push({
			id:updateid,
			weight:updateweight,
			reps:updatereps,
			time:updatetime,
			token:tokennn
		});

		db.transaction(function(ptx) {
			ptx.executeSql("update exercise_set set resultweight = ? , resultreps = ? , set_status = ? , lastupdated = ? where id = ?", [updateweight, updatereps, 1, lastupdated, updateid]);
		},dbError);

		db.transaction(function(ctx) {
			ctx.executeSql("select * from exercise_set_results where ( exercise_set_id = '"+updateid+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_set_id = '"+updateid+".0' and trainee_id = '"+trainee_id+"' )  ", [], function(ctx, results) {
				if(results.rows.length == 0){
					ctx.executeSql("insert into exercise_set_results(exercise_set_id, resultweight, resultreps, lastupdated, resulttime, token , trainee_id ) values(?,?,?,?,?,?,?)", [updateid, updateweight, updatereps, lastupdated, updatetime,tokennn, trainee_id]);
				}
				else{
					var row = results.rows.item(0);
					ctx.executeSql("update exercise_set_results set resultweight = ? , resultreps = ? , lastupdated = ? , resulttime = ? where id = ?", [updateweight, updatereps, lastupdated, updatetime,row.id]);
				}
			});
		});
	});

	if(isOnline()){
		$.ajax({
			type:'POST',
			url : apiUrl, 
			data: {
				'updatearr' : arr,
				'lastupdated' : lastupdated,
				'trainee_id' : trainee_id,
				'method' : 'db_update_exercise_set'
			}    
		});
	}

	var eIds = $('#eIds').val();
	eIds = eIds.split(',');
	$.each(eIds, function(kkey,id){

		// alert(id);

		var note = '';
		var tokennnn = get_token();

		// alert(note);

		db.transaction(function(ttx) {
			ttx.executeSql("update exercise set status = ? , notes = ? , lastupdated = ? where id = ?", [1, note, get_timestamp(), id]);
			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_notes where ( exercise_id = '"+id+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_id = '"+id+".0' and trainee_id = '"+trainee_id+"' ) ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_notes(exercise_id, trainee_id, notes, lastupdated , token ) values(?,?,?,?,?)", [id, trainee_id, note, lastupdated, tokennnn]);
						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : tokennnn,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_notes set notes = ? , lastupdated = ? where id = ?", [note, lastupdated, row.id]);
						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : row.token,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
				});
			});						
		},dbError);
	});



	circuitExerciseDetails(nextid,ids);      
}

function nextCircuitOrExercise(id, nextid, ids){
	var trainee_id = window.localStorage.getItem("userlogin");
	var lastupdated = get_timestamp();
	var min = $('#resttime').val();

	var arr = [];
	$('.res_set').each(function(){
		var tokennn = get_token();
		var updateid   = $(this).attr('id');
		var updateweight   = $(this).find('.wselect').val();
		var updatereps = $(this).find('.rselect').val();
		var updatetime = $(this).find('.tselect').val();
		arr.push({
			id:updateid,
			weight:updateweight,
			reps:updatereps,
			time:updatetime,
			token:tokennn
		});

		db.transaction(function(ptx) {
			ptx.executeSql("update exercise_set set resultweight = ? , resultreps = ? , set_status = ? , lastupdated = ? where id = ?", [updateweight, updatereps, 1, lastupdated, updateid]);
		},dbError);

		db.transaction(function(ctx) {
			ctx.executeSql("select * from exercise_set_results where ( exercise_set_id = '"+updateid+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_set_id = '"+updateid+".0' and trainee_id = '"+trainee_id+"' )  ", [], function(ctx, results) {
				if(results.rows.length == 0){
					ctx.executeSql("insert into exercise_set_results(exercise_set_id, resultweight, resultreps, lastupdated, resulttime, token , trainee_id ) values(?,?,?,?,?,?,?)", [updateid, updateweight, updatereps, lastupdated, updatetime,tokennn, trainee_id]);
				}
				else{
					var row = results.rows.item(0);
					ctx.executeSql("update exercise_set_results set resultweight = ? , resultreps = ? , lastupdated = ? , resulttime = ? where id = ?", [updateweight, updatereps, lastupdated, updatetime,row.id]);
				}
			});
		});
	});

	if(isOnline()){
		$.ajax({
			type:'POST',
			url : apiUrl, 
			data: {
				'updatearr' : arr,
				'lastupdated' : lastupdated,
				'trainee_id' : trainee_id,
				'method' : 'db_update_exercise_set'
			}    
		});
	}

	var eIds = $('#eIds').val();
	eIds = eIds.split(',');
	$.each(eIds, function(kkey,id){

		// alert(id);

		var note = '';
		var tokennnn = get_token();

		// alert(note);

		db.transaction(function(ttx) {
			ttx.executeSql("update exercise set status = ? , notes = ? , lastupdated = ? where id = ?", [1, note, get_timestamp(), id]);
			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_notes where ( exercise_id = '"+id+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_id = '"+id+".0' and trainee_id = '"+trainee_id+"' ) ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_notes(exercise_id, trainee_id, notes, lastupdated , token ) values(?,?,?,?,?)", [id, trainee_id, note, lastupdated, tokennnn]);
						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : tokennnn,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_notes set notes = ? , lastupdated = ? where id = ?", [note, lastupdated, row.id]);
						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : row.token,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
				});
			});						
		},dbError);
	});



	circuit_or_exerciseDetails(nextid,ids);      
}

function show_circuit_cooldownmodal(ids){
	var trainee_id = window.localStorage.getItem("userlogin");
	// stopcountdown();
	var lastupdated = get_timestamp();
	var min = $('#resttime').val();
	// if(min !=""){
	// 	min = parseInt(min);
	// 	var currdate = new Date();
	// 	var at = currdate.setMinutes(currdate.getMinutes() + min);      
	// 	$('.timer0').countdown({until: new Date(at),format: 'MS',layout: '{mnn}{sep}{snn}', onExpiry:stopcountdown});
	// }

	// setTimeout(function(){
		var arr = [];
		$('.res_set').each(function(){
			var tokennn = get_token();
			var updateid   = $(this).attr('id');
			var updateweight   = $(this).find('.wselect').val();
			var updatereps = $(this).find('.rselect').val();
			var updatetime = $(this).find('.tselect').val();
			arr.push({
				id:updateid,
				weight:updateweight,
				reps:updatereps,
				time:updatetime,
				token:tokennn
			});

			db.transaction(function(ptx) {
				ptx.executeSql("update exercise_set set resultweight = ? , resultreps = ? , set_status = ? , lastupdated = ? where id = ?", [updateweight, updatereps, 1, lastupdated, updateid]);
			},dbError);

			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_set_results where ( exercise_set_id = '"+updateid+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_set_id = '"+updateid+".0' and trainee_id = '"+trainee_id+"' )  ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_set_results(exercise_set_id, resultweight, resultreps, lastupdated, resulttime, token , trainee_id ) values(?,?,?,?,?,?,?)", [updateid, updateweight, updatereps, lastupdated, updatetime,tokennn, trainee_id]);
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_set_results set resultweight = ? , resultreps = ? , lastupdated = ? , resulttime = ? where id = ?", [updateweight, updatereps, lastupdated, updatetime,row.id]);
					}
				});
			});
		});

		if(isOnline()){
			$.ajax({
				type:'POST',
				url : apiUrl, 
				data: {
					'updatearr' : arr,
					'lastupdated' : lastupdated,
					'trainee_id' : trainee_id,
					'method' : 'db_update_exercise_set'
				}    
			});
		}
		
		// $.ajax({
		// 	method : 'POST',
		// 	url : apiUrl, 
		// 	data: {updatearr:arr, method:'update_exercise_set'},            
		// })
	
	/*

	ids = ids.split(',');    
	for (var rrr = 0; rrr <= ids.length; rrr++) {                          
		var id = ids[rrr];
		
		if(id != undefined){

			// alert(id);

			var note = '';

			var tokennnn = get_token();

			db.transaction(function(ttx) {
				ttx.executeSql("update exercise set status = ? , notes = ? , lastupdated = ? where id = ?", [1, note, get_timestamp(), id]);
				
				db.transaction(function(ctx) {
					ctx.executeSql("select * from exercise_notes where ( exercise_id = '"+id+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_id = '"+id+".0' and trainee_id = '"+trainee_id+"' ) ", [], function(ctx, results) {
						if(results.rows.length == 0){
							ctx.executeSql("insert into exercise_notes(exercise_id, trainee_id, notes, lastupdated , token ) values(?,?,?,?,?)", [id, trainee_id, note, lastupdated, tokennnn]);

							if(isOnline()){
								$.ajax({
									type:'POST',
									url : apiUrl, 
									data: {
										'id' : id,
										'note' : note,
										'lastupdated' : lastupdated,
										'token' : tokennnn,
										'trainee_id' : trainee_id,
										'method' : 'db_update_exercise'
									}    
								});
							}
						}
						else{
							var row = results.rows.item(0);
							ctx.executeSql("update exercise_notes set notes = ? , lastupdated = ? where id = ?", [note, lastupdated, row.id]);

							if(isOnline()){
								$.ajax({
									type:'POST',
									url : apiUrl, 
									data: {
										'id' : id,
										'note' : note,
										'lastupdated' : lastupdated,
										'token' : row.token,
										'trainee_id' : trainee_id,
										'method' : 'db_update_exercise'
									}    
								});
							}
						}
					});
				});

							
			},dbError);
		}
	}

	*/

	var eIds = $('#eIds').val();
	eIds = eIds.split(',');
	$.each(eIds, function(kkey,id){
		var note = '';
		var tokennnn = get_token();

		// alert(note);

		db.transaction(function(ttx) {
			ttx.executeSql("update exercise set status = ? , notes = ? , lastupdated = ? where id = ?", [1, note, get_timestamp(), id]);
			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_notes where ( exercise_id = '"+id+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_id = '"+id+".0' and trainee_id = '"+trainee_id+"' ) ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_notes(exercise_id, trainee_id, notes, lastupdated , token ) values(?,?,?,?,?)", [id, trainee_id, note, lastupdated, tokennnn]);
						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : tokennnn,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_notes set notes = ? , lastupdated = ? where id = ?", [note, lastupdated, row.id]);
						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : row.token,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
				});
			});						
		},dbError);
	});

		// $.ajax({
		// 	type:'POST',
		// 	url : apiUrl, 
		// 	data: {id:id,note:note, method:'update_exercise'},    
		// });
   
		$('#hideonmodal').hide();
		$('#modalbox').hide();   
		$('#Rmodalbox').hide();
		// $('#cooldownmodal').show();
		$('#tabbarbtm').hide();
		$('.navigation-bar').css('z-index',0);
		$('.block').css('z-index',9999); 

		// show_finishedmodal();

		var wid = $("#workout_iddd").val();

		var sq_query = "SELECT * FROM (`exercise`) WHERE `workout_id` =  '"+wid+"'";

		db.transaction(function(tx) {
			tx.executeSql(sq_query, [], function(tx, results) {
				var exercise_ids = [];
				var eiddd;
				
				for(var i=0; i<results.rows.length; i++) {
					eiddd = results.rows.item(i).id;
					exercise_ids.push(' exercise_id = ' + eiddd + ' ');
				}

				var where = '';

				if(exercise_ids.length > 0){
					where = exercise_ids.join(' OR ');
				}
				else{
					db_returntohome(wid);
					return 0;
				}

				if(where != ''){
					where = 'where '+where;
				}

				db.transaction(function(ctx) {
					ctx.executeSql("select * from exercise_set "+where, [], function(ctx, resultss) {

						var exercise_set_ids = []; 
						var e_set_id;

						for(var i=0; i<resultss.rows.length; i++) {
							e_set_id = resultss.rows.item(i).id;
							exercise_set_ids.push(e_set_id);
						}

						where = '';

						if(exercise_set_ids.length > 0){
							where = exercise_set_ids.join(' OR ');
						}
						else{
							db_returntohome(wid);
							return 0;
						}

						if(where != ''){
							where = 'where '+where;
						}

						sq_query = "SELECT `esr`.`id`, `es`.`value`, `esr`.`resultweight`, `es`.`time`, `esr`.`resulttime`, `es`.`reps`, `esr`.`resultreps` FROM (`exercise_set` as es) JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id`";

						sq_query += " WHERE `es`.`id` IN ( "+exercise_set_ids.join(' , ')+" ) ";

						sq_query += " AND `esr`.`trainee_id` =  '"+trainee_id+"' ";

						db.transaction(function(ptx) {
							ptx.executeSql(sq_query, [], function(ctx, resultsss) {

								if(resultsss.rows.length == resultss.rows.length){

									var flaggg = true;

									for(var i=0; i<resultsss.rows.length; i++) {

										var row = resultsss.rows.item(i);

										if( (row.value != row.resultweight) || (row.time != row.resulttime) || (row.reps != row.resultreps) ){
											flaggg = false;
										}

									}

									if(flaggg){
										show_finishedmodal();
										return 0;
									}
									else{
										db_returntohome(wid);
										return 0;
									}
								
								}
								else{
									db_returntohome(wid);
									return 0;
								}

							})
						});
					})
				});
			})
		});

		// alert(1);
  // }, 10)
}

function show_circuitOrExercise_cooldownmodal(ids){
	var trainee_id = window.localStorage.getItem("userlogin");
	var lastupdated = get_timestamp();
	var min = $('#resttime').val();
	
		var arr = [];
		$('.res_set').each(function(){
			var tokennn = get_token();
			var updateid   = $(this).attr('id');
			var updateweight   = $(this).find('.wselect').val();
			var updatereps = $(this).find('.rselect').val();
			var updatetime = $(this).find('.tselect').val();
			arr.push({
				id:updateid,
				weight:updateweight,
				reps:updatereps,
				time:updatetime,
				token:tokennn
			});

			db.transaction(function(ptx) {
				ptx.executeSql("update exercise_set set resultweight = ? , resultreps = ? , set_status = ? , lastupdated = ? where id = ?", [updateweight, updatereps, 1, lastupdated, updateid]);
			},dbError);

			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_set_results where ( exercise_set_id = '"+updateid+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_set_id = '"+updateid+".0' and trainee_id = '"+trainee_id+"' )  ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_set_results(exercise_set_id, resultweight, resultreps, lastupdated, resulttime, token , trainee_id ) values(?,?,?,?,?,?,?)", [updateid, updateweight, updatereps, lastupdated, updatetime,tokennn, trainee_id]);
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_set_results set resultweight = ? , resultreps = ? , lastupdated = ? , resulttime = ? where id = ?", [updateweight, updatereps, lastupdated, updatetime,row.id]);
					}
				});
			});
		});

		if(isOnline()){
			$.ajax({
				type:'POST',
				url : apiUrl, 
				data: {
					'updatearr' : arr,
					'lastupdated' : lastupdated,
					'trainee_id' : trainee_id,
					'method' : 'db_update_exercise_set'
				}    
			});
		}
		
		
	var eIds = $('#eIds').val();
	eIds = eIds.split(',');
	$.each(eIds, function(kkey,id){
		var note = '';
		var tokennnn = get_token();

		// alert(note);

		db.transaction(function(ttx) {
			ttx.executeSql("update exercise set status = ? , notes = ? , lastupdated = ? where id = ?", [1, note, get_timestamp(), id]);
			db.transaction(function(ctx) {
				ctx.executeSql("select * from exercise_notes where ( exercise_id = '"+id+"' and trainee_id = '"+trainee_id+"' ) OR ( exercise_id = '"+id+".0' and trainee_id = '"+trainee_id+"' ) ", [], function(ctx, results) {
					if(results.rows.length == 0){
						ctx.executeSql("insert into exercise_notes(exercise_id, trainee_id, notes, lastupdated , token ) values(?,?,?,?,?)", [id, trainee_id, note, lastupdated, tokennnn]);
						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : tokennnn,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
					else{
						var row = results.rows.item(0);
						ctx.executeSql("update exercise_notes set notes = ? , lastupdated = ? where id = ?", [note, lastupdated, row.id]);
						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'id' : id,
									'note' : note,
									'lastupdated' : lastupdated,
									'token' : row.token,
									'trainee_id' : trainee_id,
									'method' : 'db_update_exercise'
								}    
							});
						}
					}
				});
			});						
		},dbError);
	});

		$('#hideonmodal').hide();
		$('#modalbox').hide();   
		$('#Rmodalbox').hide();
		// $('#cooldownmodal').show();
		$('#tabbarbtm').hide();
		$('.navigation-bar').css('z-index',0);
		$('.block').css('z-index',9999); 

		// show_finishedmodal();

		var wid = $("#workout_iddd").val();

		var sq_query = "SELECT * FROM (`exercise`) WHERE `workout_id` =  '"+wid+"'";

		db.transaction(function(tx) {
			tx.executeSql(sq_query, [], function(tx, results) {
				var exercise_ids = [];
				var eiddd;
				
				for(var i=0; i<results.rows.length; i++) {
					eiddd = results.rows.item(i).id;
					exercise_ids.push(' exercise_id = ' + eiddd + ' ');
				}

				var where = '';

				if(exercise_ids.length > 0){
					where = exercise_ids.join(' OR ');
				}
				else{
					db_returntohome(wid);
					return 0;
				}

				if(where != ''){
					where = 'where '+where;
				}

				db.transaction(function(ctx) {
					ctx.executeSql("select * from exercise_set "+where, [], function(ctx, resultss) {

						var exercise_set_ids = []; 
						var e_set_id;

						for(var i=0; i<resultss.rows.length; i++) {
							e_set_id = resultss.rows.item(i).id;
							exercise_set_ids.push(e_set_id);
						}

						where = '';

						if(exercise_set_ids.length > 0){
							where = exercise_set_ids.join(' OR ');
						}
						else{
							db_returntohome(wid);
							return 0;
						}

						if(where != ''){
							where = 'where '+where;
						}

						sq_query = "SELECT `esr`.`id`, `es`.`value`, `esr`.`resultweight`, `es`.`time`, `esr`.`resulttime`, `es`.`reps`, `esr`.`resultreps` FROM (`exercise_set` as es) JOIN `exercise_set_results` as esr ON `esr`.`exercise_set_id` = `es`.`id`";

						sq_query += " WHERE `es`.`id` IN ( "+exercise_set_ids.join(' , ')+" ) ";

						sq_query += " AND `esr`.`trainee_id` =  '"+trainee_id+"' ";

						db.transaction(function(ptx) {
							ptx.executeSql(sq_query, [], function(ctx, resultsss) {

								if(resultsss.rows.length == resultss.rows.length){

									var flaggg = true;

									for(var i=0; i<resultsss.rows.length; i++) {

										var row = resultsss.rows.item(i);

										if( (row.value != row.resultweight) || (row.time != row.resulttime) || (row.reps != row.resultreps) ){
											flaggg = false;
										}

									}

									if(flaggg){
										show_finishedmodal();
										return 0;
									}
									else{
										db_returntohome(wid);
										return 0;
									}
								
								}
								else{
									db_returntohome(wid);
									return 0;
								}

							})
						});
					})
				});
			})
		});

		// alert(1);
  // }, 10)
}

function db_setCalendarPage(){
	

	// displayAll();
	// return 0;
	$("#clndr").css('padding-top','40px');
	var trid =  window.localStorage.getItem('userlogin');    
	var month = parseInt(window.localStorage.getItem('monthh'));
	var year = window.localStorage.getItem('yearr');

	
	var curr = new Date; // get current date
	var d = new Date; // get current date
	var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
	var firstday = new Date(curr.setDate(first));
	var week_f_date = curr.getFullYear()+'/'+curr.getMonth()+'/'+firstday.getDate();
	var current_date = d.getFullYear()+'_'+d.getMonth()+'_'+d.getDate();
	
	if( parseInt(month) == ( parseInt(curr.getMonth()) + 1 ) ){
		var ss = true;
	}
	else{
		var ss = false;
	}

	// for(var qq = 0 ; qq < 7 ; qq++ ){
	// 	alert(parseInt(first+qq))
	// } 

	if(month <= 9){
		month = '0'+month;
	}

	// var sqlite = "SELECT `tw`.*, `w`.`name`, `w`.`date`, `w`.`status` FROM (`trainee_workout` as tw) LEFT JOIN `workout` as w ON `w`.`id` = `tw`.`workout_id` WHERE `tw`.`trainee_id` = "+trid+" AND `date` LIKE '"+year+"-"+month+"-%' GROUP BY `tw`.`workout_id` ORDER BY `w`.`date` asc";
	var sqlite = "SELECT `tw`.*, `w`.`name`, `w`.`type` as wtype , `w`.`date`, `wn`.`id` as status FROM (`trainee_workout` as tw) LEFT JOIN `workout` as w ON `w`.`id` = `tw`.`workout_id` LEFT JOIN `workout_notes` as wn ON `wn`.`workout_id` = `w`.`id` AND `wn`.`trainee_id` = '"+trid+"' WHERE `tw`.`trainee_id` = "+trid+" AND `date` LIKE '"+year+"-"+month+"-%' GROUP BY `tw`.`workout_id` ORDER BY `w`.`date` asc";
	
	db.transaction(function(ctx) {
		ctx.executeSql(sqlite, [], function(ctx, results) {



			on_off_n_p_btn();

			if(results.rows.length == 0){
				this_is_not_current_month();
				open_calender();
				return 0;
			}

			var rows = [];

			for(var date_row=0;date_row < results.rows.length; date_row++) {
				var row = results.rows.item(date_row);
				rows.push(row);
			}

			$("#clndr").css('padding-top','40px'); 
			var av_dates = [];
			var new_divs = [];
			
			$.each(rows, function(index, value){ 
				var onclick = '';

				var n = date('n',strtotime(value.date)) - 1 ;
				
				var dd = date('d',strtotime(value.date));

				var sstylee = 'style="display:none;"';

				if(ss){
					for(var qq = 0 ; qq < 7 ; qq++ ){
						if(parseInt(first+qq) == dd ){
							sstylee = '';
						}
					}
				}

				if(value.status == null)					
					var div_class = date('Y_'+n+'_j', strtotime(value.date));
				else
					var div_class = date('Y_'+n+'_j', strtotime(value.date))+" calgrey";	

				var ndivclass = date('Y_'+n+'_j', strtotime(value.date));

				// if(div_class == current_date){
				// 	onclick = 'onclick="ons.slidingMenu.setAbovePage(\'page4.html\')"';
				// }else{
				

					// onclick = 'onclick="return getWorkout_byid('+value.workout_id+')"'

					if(value.wtype == 3 || value.wtype == '3' || value.wtype == '3.0')
						var methodname = 'db_getNewCircuitWorkoutById';
					else if(value.wtype == 2 || value.wtype == '2' || value.wtype == '2.0')
						var methodname = 'db_getCircuitWorkout_byid';
					else
						var methodname = 'db_getWorkout_byid';

					onclick = 'onclick="return '+methodname+'('+value.workout_id+')"'
				

				// }

				
				// $('#caltasks').append('<li '+sstylee+' class="'+div_class+'" '+onclick+' ><p>'+date('l, F d',strtotime(value.date))+'</p>'+value.name+'</li>');
				
				// if($('#caltasks li.'+date('Y_'+n+'_j', strtotime(value.date))).html() == '')
				
				if($("li."+ndivclass).html() == undefined ){
					$('#caltasks').append('<li '+sstylee+' class="'+div_class+'"><p>'+date('l, F d',strtotime(value.date))+'</p></li>');
				}

				var w_name = 'li.'+ndivclass+'<==>'+'<span '+onclick+'><br>'+value.name+'<br></span>'

				av_dates.push(div_class);
				new_divs.push(w_name);
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

			// show_single_row();

			var expand = window.localStorage.getItem('expand');
			// if(expand == 1){
				window.localStorage.setItem('expand', 2);
				open_calender();
			// }

		});
	});
}

function db_getWorkout_byid(workid){
	$('#pnworkoutpage').trigger('click');
	var trainee_id =  window.localStorage.getItem('userlogin');

	var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var d = new Date();          
	var dat = monthNames[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();

	var today_date = d.getFullYear() + '-' + parseInt(d.getMonth()+1) + '-' + d.getDate();

	var sqlite = 'SELECT `w`.*, `tw`.`trainee_id` FROM (`workout` as w) JOIN `trainee_workout` as tw ON `tw`.`workout_id` = `w`.`id` WHERE `w`.`id` = "'+workid+'" ORDER BY `w`.`date` asc';

	db.transaction(function(tx) {
		tx.executeSql(sqlite, [], function(tx, results) {
			if(results.rows.length == 0){
				set_blank_homepage();
				return 0;
			}
			
			var workout = results.rows.item(0);
			showLoader();
			setTimeout(function(){
				if(workout){
					if(workout.type == '2' || workout.type == 2 || workout.type == '2.0'){
						db_getCircuitWorkout_byid(workid);
						return 0;
					}

					if(workout.type == '3' || workout.type == 3 || workout.type == '3.0'){
						getNewCircuitWorkoutById(workid);
						return 0;
					}

					var workoutdate = date("M d,Y", strtotime(workout.date));
					var workouttime = date("h:i", strtotime(workout.time));

					var wTime = strtotime( workout.date + ' ' + workout.time );
					var tTime = get_timestamp();

					wTime = parseInt(wTime) + parseInt( 86400 ); // one day seconds = 86400

					if(wTime < tTime){
						var updateAbility = false;
					}
					else{
						var updateAbility = true;
						if(date('Y-m-d') == date("Y-m-d", strtotime(workout.date))){
							window.localStorage.setItem('do_exercise', '1');
						}
						else if(date('Y-m-d') > date("Y-m-d", strtotime(workout.date))){
							window.localStorage.setItem('do_exercise', '1');
							updateAbility = false;
						}
						else{
							window.localStorage.setItem('do_exercise', '0');
							// window.localStorage.setItem('do_exercise', '1');
						}
					}

					// updateAbility = false;

					$('#noworkoutbtn').hide();
					db_update_workoutstatus(workout.id);
					
					if(workout.base64image != '' && workout.base64image != '0'){
						$('#workoutimage').attr('src', workout.base64image);
						$('#workoutimage')
							.load(function(){
								// alert('Image is loaded');
							})
							.error(function(){
								// alert('Image is not loaded');
								$('#workoutimage').remove();
								$('#wdescription').css('padding-top', '50px');
							});
					}
					else{
						// $('#workoutimage').attr('src', no_image);
						$('#workoutimage').remove();
						$('#wdescription').css('padding-top', '50px');
					}
					
					$('#timeval').html(workouttime);
					$('#wnamedate').html(workout.name+' <span>'+workoutdate+'</span>');
	        		$('#wdescription').html(workout.description);
	        		
	        		

			        // sqlite = 'SELECT * FROM exercise where workout_id = '+workout.id;

			        var triddd =  window.localStorage.getItem('userlogin');

			        sqlite = 'SELECT `e`.`id`, `e`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `en`.`id` as status, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated` FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+triddd+'" WHERE `e`.`workout_id` = '+workout.id;

			        // alert(sqlite);

			        db.transaction(function(ctx) {
						ctx.executeSql(sqlite, [], function(ctx, exercise_results) {
							var i = 1;
					        var j = 1;
					        var content = "";
					        var ids="";
					        var k = 1;

					        var ids_arr = [];
					        var exercise;
					        var clos;

							var flag = 0;
							for(var iii=0;iii < exercise_results.rows.length; iii++) {
								exercise = exercise_results.rows.item(iii);
								ids_arr.push(exercise.id);
							}

							ids = ids_arr.join(',');

							// alert(ids);
							content +='<ons-row class="row ons-row-inner" >';
							for(var iii=0;iii < exercise_results.rows.length; iii++) {
								exercise = exercise_results.rows.item(iii);
								
								if(updateAbility){
									if(flag==0){ // && exercise.status != null
						              $('#workoutbtn').attr('onclick','return exerciseDetails('+exercise.id+', \''+ids+'\')')
						              if(window.localStorage.getItem('do_exercise') === '0'){
						              	$('#workoutbtn').html('View Workout');
						              }
						              flag=1;
						            }
								}
								else{
									if(flag==0){
						              $('#workoutbtn').html('View Workout');
						              $('#workoutbtn').attr('onclick','return oldExerciseDetails('+exercise.id+', \''+ids+'\')')
						              flag=1;
						            }
								}

								/*
								if(!updateAbility){
									$('ons-tabbar').remove();
								}

								if(flag==0 && exercise.status == 0){
					              if(updateAbility){	
					              	$('#workoutbtn').attr('onclick','return exerciseDetails('+exercise.id+', \''+ids+'\')')
					              }
					              else{
					              	$('ons-tabbar').remove();
					              }

					              flag=1;
					            }
					            */

								
								clos = '';
					            
					            /*
					            if(exercise.status == 1){
					              var clos = 'closed';
					            }
					            */

					            if(exercise.status != null){
					              var clos = 'closed';
					            }
					            	
					            if(updateAbility)
									content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return exerciseDetails('+exercise.id+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+exercise.name+'</a></ons-col>';
								else
									content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return oldExerciseDetails('+exercise.id+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+exercise.name+'</a></ons-col>';

					            if(i%2 == 0){
					              content +='</ons-row>';
					              content +='<ons-row class="row ons-row-inner" >';
					            }

					            i++;
	            				j++;

							}

							content +='</ons-row>'; 

							$('#appendexercises').append(content); 

							$('#workoutbtn').show();

						})
					},dbError);
					hideLoader();
				}
				else{
					// alert('No Date Match');
					set_blank_homepage();
					hideLoader();
					return 0;
				}
			},800);
		})
	},dbError);
}

function db_getNewCircuitWorkoutById(workid){
	$('#pnworkoutpage').trigger('click');
	var trainee_id =  window.localStorage.getItem('userlogin');
	var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var d = new Date();          
	var dat = monthNames[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
	var today_date = d.getFullYear() + '-' + parseInt(d.getMonth()+1) + '-' + d.getDate();
	var sqlite = 'SELECT `w`.*, `tw`.`trainee_id` FROM (`workout` as w) JOIN `trainee_workout` as tw ON `tw`.`workout_id` = `w`.`id` WHERE `w`.`id` = "'+workid+'" ORDER BY `w`.`date` asc';
	db.transaction(function(tx) {
		tx.executeSql(sqlite, [], function(tx, results) {
			if(results.rows.length == 0){
				set_blank_homepage();
				return 0;
			}
			
			var workout = results.rows.item(0);
			showLoader();
			setTimeout(function(){
				if(workout){
					var workoutdate = date("M d,Y", strtotime(workout.date));
					var workouttime = date("h:i", strtotime(workout.time));

					var wTime = strtotime( workout.date + ' ' + workout.time );
					var tTime = get_timestamp();

					wTime = parseInt(wTime) + parseInt( 86400 ); // one day seconds = 86400

					if(wTime < tTime){
						var updateAbility = false;
					}
					else{
						var updateAbility = true;
						if(date('Y-m-d') == date("Y-m-d", strtotime(workout.date))){
							window.localStorage.setItem('do_exercise', '1');
						}
						else if(date('Y-m-d') > date("Y-m-d", strtotime(workout.date))){
							window.localStorage.setItem('do_exercise', '1');
							updateAbility = false;
						}
						else{
							window.localStorage.setItem('do_exercise', '0');
							// window.localStorage.setItem('do_exercise', '1');
						}
					}

					// updateAbility = false;

					$('#noworkoutbtn').hide();
					db_update_workoutstatus(workout.id);
					
					if(workout.base64image != '' && workout.base64image != '0'){
						$('#workoutimage').attr('src', workout.base64image);
						$('#workoutimage')
							.load(function(){
								// alert('Image is loaded');
							})
							.error(function(){
								// alert('Image is not loaded');
								$('#workoutimage').remove();
								$('#wdescription').css('padding-top', '50px');
							});
					}
					else{
						// $('#workoutimage').attr('src', no_image);
						$('#workoutimage').remove();
						$('#wdescription').css('padding-top', '50px');
					}
					
					$('#timeval').html(workouttime);
					$('#wnamedate').html(workout.name+' <span>'+workoutdate+'</span>');
	        		$('#wdescription').html(workout.description);
	        		
	        		

			        // sqlite = 'SELECT * FROM exercise where workout_id = '+workout.id;

			        var triddd =  window.localStorage.getItem('userlogin');

			        sqlite = 'SELECT `e`.`id`, `e`.`circuit_id`, `e`.`notes`, `e`.`workout_id`, `c`.`name` as cname , `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `en`.`id` as status, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated` FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+triddd+'" LEFT JOIN `circuit` as c ON `c`.`id` = `e`.`circuit_id` WHERE `e`.`workout_id` = '+workout.id;

			        // alert(sqlite);

			        db.transaction(function(ctx) {
						ctx.executeSql(sqlite, [], function(ctx, exercise_results) {
							var i = 1;
					        var j = 1;
					        var content = "";
					        var ids="";
					        var k = 1;

					        var ids_arr = [];
					        var e_and_c_ids = [];
					        var ne_and_c_ids = [];
					        var exercise;
					        var clos;

							var flag = 0;
							for(var iii=0;iii < exercise_results.rows.length; iii++) {
								exercise = exercise_results.rows.item(iii);
								if(exercise.circuit_id == '0'){
									ids_arr.push('exercise_'+exercise.id);
								}
								else{
									if($.inArray(exercise.circuit_id, e_and_c_ids) == -1){
										e_and_c_ids.push(exercise.circuit_id);
										ids_arr.push('circuit_'+exercise.circuit_id);
									}
								}
							}

							ids = ids_arr.join(',');

							// alert(ids);
							content +='<ons-row class="row ons-row-inner" >';
							for(var iii=0;iii < exercise_results.rows.length; iii++) {
								exercise = exercise_results.rows.item(iii);
								
								if(exercise.circuit_id != '0'){
									if($.inArray(exercise.circuit_id, ne_and_c_ids) == -1){
										ne_and_c_ids.push(exercise.circuit_id);
									}
									else{
										continue;
									}
								}


								if(updateAbility){
									if(flag==0){ // && exercise.status != null
						              
						              if(exercise.circuit_id == '0'){
						              	$('#workoutbtn').attr('onclick','return circuit_or_exerciseDetails('+"'exercise_"+exercise.id+"'"+', \''+ids+'\')')
						              	// alert('return circuit_or_exerciseDetails('+"'exercise_"+exercise.id+"'"+', \''+ids+'\')');
						              }
						              else{
										$('#workoutbtn').attr('onclick','return circuit_or_exerciseDetails('+"'circuit_"+exercise.circuit_id+"'"+', \''+ids+'\')')
										// alert('return circuit_or_exerciseDetails('+"'circuit_"+exercise.circuit_id+"'"+', \''+ids+'\')');
									  }

						              if(window.localStorage.getItem('do_exercise') === '0'){
						              	$('#workoutbtn').html('View Workout');
						              }
						              flag=1;
						            }
								}
								else{
									if(flag==0){
						              $('#workoutbtn').html('View Workout');
						              
						              if(exercise.circuit_id == '0'){
						              	$('#workoutbtn').attr('onclick','return oldCircuitOrExerciseDetails('+"'exercise_"+exercise.id+"'"+', \''+ids+'\')')
						              }
						              else{
						              	$('#workoutbtn').attr('onclick','return oldCircuitOrExerciseDetails('+"'circuit_"+exercise.circuit_id+"'"+', \''+ids+'\')')
						              }
						              flag=1;
						            }
								}

								/*
								if(!updateAbility){
									$('ons-tabbar').remove();
								}

								if(flag==0 && exercise.status == 0){
					              if(updateAbility){	
					              	$('#workoutbtn').attr('onclick','return exerciseDetails('+exercise.id+', \''+ids+'\')')
					              }
					              else{
					              	$('ons-tabbar').remove();
					              }

					              flag=1;
					            }
					            */

								
								clos = '';
					            
					            /*
					            if(exercise.status == 1){
					              var clos = 'closed';
					            }
					            */

					            if(exercise.status != null){
					              var clos = 'closed';
					            }
					            	
					            if(updateAbility){
									if(exercise.circuit_id == '0'){
										content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return circuit_or_exerciseDetails('+"'exercise_"+exercise.id+"'"+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+exercise.name+'</a></ons-col>';
									}
									else{
										content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return circuit_or_exerciseDetails('+"'circuit_"+exercise.circuit_id+"'"+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+exercise.cname+'</a></ons-col>';									
									}
								}
								else{
									if(exercise.circuit_id == '0'){
										content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return oldCircuitOrExerciseDetails('+"'exercise_"+exercise.id+"'"+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+exercise.name+'</a></ons-col>';
									}
									else{
										content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return oldCircuitOrExerciseDetails('+"'circuit_"+exercise.circuit_id+"'"+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+exercise.cname+'</a></ons-col>';									
									}
								}

					            if(i%2 == 0){
					              content +='</ons-row>';
					              content +='<ons-row class="row ons-row-inner" >';
					            }

					            i++;
	            				j++;

							}

							content +='</ons-row>'; 

							$('#appendexercises').append(content); 

							$('#workoutbtn').show();

						})
					},dbError);
					hideLoader();
				}
				else{
					// alert('No Date Match');
					set_blank_homepage();
					hideLoader();
					return 0;
				}
			},800);
		})
	},dbError);
}

function db_getCircuitWorkout_byid(workid){
	$('#pnworkoutpage').trigger('click');
	var trainee_id =  window.localStorage.getItem('userlogin');
	var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var d = new Date();          
	var dat = monthNames[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
	var today_date = d.getFullYear() + '-' + parseInt(d.getMonth()+1) + '-' + d.getDate();
	var sqlite = 'SELECT `w`.*, `tw`.`trainee_id` FROM (`workout` as w) JOIN `trainee_workout` as tw ON `tw`.`workout_id` = `w`.`id` WHERE `w`.`id` = "'+workid+'" ORDER BY `w`.`date` asc';
	db.transaction(function(tx) {
		tx.executeSql(sqlite, [], function(tx, results) {
			if(results.rows.length == 0){
				set_blank_homepage();
				return 0;
			}
			
			var workout = results.rows.item(0);
			setTimeout(function(){
				if(workout){
					if(workout.type == '1' || workout.type == 1 || workout.type == '1.0'){
						db_getWorkout_byid(workid);
						return 0;
					}

					var workoutdate = date("M d,Y", strtotime(workout.date));
					var workouttime = date("h:i", strtotime(workout.time));

					var wTime = strtotime( workout.date + ' ' + workout.time );
					var tTime = get_timestamp();

					wTime = parseInt(wTime) + parseInt( 86400 ); // one day seconds = 86400

					if(wTime < tTime){
						var updateAbility = false;
					}
					else{
						var updateAbility = true;
						if(date('Y-m-d') == date("Y-m-d", strtotime(workout.date))){
							window.localStorage.setItem('do_exercise', '1');
						}
						else if(date('Y-m-d') > date("Y-m-d", strtotime(workout.date))){
							window.localStorage.setItem('do_exercise', '1');
							updateAbility = false;
						}
						else{
							window.localStorage.setItem('do_exercise', '0');
							// window.localStorage.setItem('do_exercise', '1');
						}
					}

					// updateAbility = false;

					$('#noworkoutbtn').hide();
					db_update_workoutstatus(workout.id);
					
					if(workout.base64image != '' && workout.base64image != '0'){
						$('#workoutimage').attr('src', workout.base64image);
						$('#workoutimage')
							.load(function(){
								// alert('Image is loaded');
							})
							.error(function(){
								// alert('Image is not loaded');
								$('#workoutimage').remove();
								$('#wdescription').css('padding-top', '50px');
							});
					}
					else{
						// $('#workoutimage').attr('src', no_image);
						$('#workoutimage').remove();
						$('#wdescription').css('padding-top', '50px');
					}
					
					$('#timeval').html(workouttime);
					$('#wnamedate').html(workout.name+' <span>'+workoutdate+'</span>');
	        		$('#wdescription').html(workout.description);

	        		// $('#wdescription').append('<p>Circuit Exercise</p>');
	        		
	        		

			        // sqlite = 'SELECT * FROM exercise where workout_id = '+workout.id;

			        // sqlite = 'SELECT `e`.`id`, `e`.`notes`, `e`.`workout_id`, `e`.`name`, `e`.`description`, `e`.`timetaken`, `e`.`resttime`, `e`.`image`, `en`.`id` as status, `e`.`created`, `e`.`updated`, `e`.`token`, `e`.`lastupdated` FROM (`exercise` as e) LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` WHERE `e`.`workout_id` = '+workout.id;

			        // sqlite = 'SELECT `id`, `name`, `workout_id` FROM `circuit` WHERE `workout_id` = '+workout.id;

			        var triddd =  window.localStorage.getItem('userlogin');

			        sqlite = 'SELECT `c`.`id`, `c`.`name`, `c`.`workout_id`, `en`.`notes` as status FROM (`circuit` as c) LEFT JOIN `exercise` as e ON `e`.`circuit_id` = `c`.`id` LEFT JOIN `exercise_notes` as en ON `en`.`exercise_id` = `e`.`id` AND `en`.`trainee_id` = "'+triddd+'" WHERE `c`.`workout_id` = "'+workout.id+'" GROUP BY `c`.`id` ORDER BY `c`.`id` asc';

			        // alert(sqlite);

			        db.transaction(function(ctx) {
						ctx.executeSql(sqlite, [], function(ctx, exercise_results) {
							var i = 1;
					        var j = 1;
					        var content = '<ons-row class="row ons-row-inner">';
					        content += '<ons-col class="col ons-col-inner" style="color:#fff;">';
					        content += 'Circuit Exercise';
					        content += '</ons-col>';
					        content += '</ons-row>';
					        var ids="";
					        var k = 1;

					        var ids_arr = [];
					        var exercise;
					        var clos;

							var flag = 0;
							for(var iii=0;iii < exercise_results.rows.length; iii++) {
								exercise = exercise_results.rows.item(iii);
								ids_arr.push(exercise.id);
							}

							ids = ids_arr.join(',');

							// alert(ids);
							content +='<ons-row class="row ons-row-inner" >';
							for(var iii=0;iii < exercise_results.rows.length; iii++) {
								exercise = exercise_results.rows.item(iii);

								// alert(exercise.id);
								// alert(ids);
								
								if(updateAbility){
									if(flag==0){ // && exercise.status != null
						              $('#workoutbtn').attr('onclick','return circuitExerciseDetails('+exercise.id+', \''+ids+'\')')
						              if(window.localStorage.getItem('do_exercise') === '0'){
						              	$('#workoutbtn').html('View Workout');
						              }
						              flag=1;
						            }
								}
								else{
									if(flag==0){
						              $('#workoutbtn').html('View Workout');
						              $('#workoutbtn').attr('onclick','return oldCircuitExerciseDetails('+exercise.id+', \''+ids+'\')')
						              flag=1;
						            }
								}

								/*
								if(!updateAbility){
									$('ons-tabbar').remove();
								}

								if(flag==0 && exercise.status == 0){
					              if(updateAbility){	
					              	$('#workoutbtn').attr('onclick','return exerciseDetails('+exercise.id+', \''+ids+'\')')
					              }
					              else{
					              	$('ons-tabbar').remove();
					              }

					              flag=1;
					            }
					            */

								
								clos = '';
					            
					            /*
					            if(exercise.status == 1){
					              var clos = 'closed';
					            }
					            */

					            if(exercise.status != null){
					              var clos = 'closed';
					            }
					            	
					   //          if(updateAbility)
								// 	content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#"><span>'+parseInt(j)+'</span>'+exercise.name+'</a></ons-col>';
								// else
								// 	content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#"><span>'+parseInt(j)+'</span>'+exercise.name+'</a></ons-col>';

					            
					            if(updateAbility)
									content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return circuitExerciseDetails('+exercise.id+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+exercise.name+'</a></ons-col>';
								else
									content +='<ons-col class="'+clos+' col ons-col-inner"><a href="#" onclick="return oldCircuitExerciseDetails('+exercise.id+', \''+ids+'\')"><span>'+parseInt(j)+'</span>'+exercise.name+'</a></ons-col>';



					            if(i%2 == 0){
					              content +='</ons-row>';
					              content +='<ons-row class="row ons-row-inner" >';
					            }

					            i++;
	            				j++;

							}

							content +='</ons-row>'; 

							$('#appendexercises').append(content); 

							$('#workoutbtn').show();

						})
					},dbError);
					hideLoader();
				}
				else{
					// alert('No Date Match');
					set_blank_homepage();
					hideLoader();
					return 0;
				}
			},800);
		})
	},dbError);
}

function oldreturntohome(workoutid){
	$('#oncalpage').trigger('click');
}

function db_returntohome(workoutid){
	var note = $('#workout_notes').val();
	var lastupdated = get_timestamp();
	var trainee_id = window.localStorage.getItem("userlogin");
	var tokenn = get_token(); 
	// $.ajax({
	// 	type:'POST',
	// 	url : apiUrl, 
	// 	data: {id:workoutid,note:note, method:'update_workoutnote'},    
	// });

	db.transaction(function(ttx) {
		ttx.executeSql("update workout set notes = ? , lastupdated = ? where id = ?", [note, lastupdated, workoutid]);
		
		db.transaction(function(ctx) {
			ctx.executeSql("select * from workout_notes where ( workout_id = '"+workoutid+"' and trainee_id = '"+trainee_id+"' ) OR ( workout_id = '"+workoutid+".0' and trainee_id = '"+trainee_id+"' ) ", [], function(ctx, results) {
				if(results.rows.length == 0){
					ctx.executeSql("insert into workout_notes(workout_id, trainee_id, notes, lastupdated , token ) values(?,?,?,?,?)", [workoutid, trainee_id, note, lastupdated, tokenn]);

					if(isOnline()){
						$.ajax({
							type:'POST',
							url : apiUrl, 
							data: {
								'id' : workoutid,
								'note' : note,
								'lastupdated' : lastupdated,
								'token' : tokenn,
								'trainee_id' : trainee_id,
								'method' : 'db_update_workoutnote'
							}    
						});
					}
				}
				else{
					var row = results.rows.item(0);
					ctx.executeSql("update workout_notes set notes = ? , lastupdated = ? where id = ?", [note, lastupdated, row.id]);

					if(isOnline()){
						$.ajax({
							type:'POST',
							url : apiUrl, 
							data: {
								'id' : workoutid,
								'note' : note,
								'lastupdated' : lastupdated,
								'token' : row.token,
								'trainee_id' : trainee_id,
								'method' : 'db_update_workoutnote'
							}    
						});
					}
				}
			});
		});
	},dbError);

	db_update_workoutstatus(workoutid);

	// $('#clicktoreturn').trigger('click');
	$('#oncalpage').trigger('click');
}

function db_setHelppage(){
	var trainee_id =  window.localStorage.getItem('userlogin');
	var sqlite = "SELECT * FROM support WHERE trainee_id = ? AND status = ? AND by = ? ORDER BY id desc";
	
	db.transaction(function(ctx) {
		ctx.executeSql(sqlite, [trainee_id, '1', '2'], function(ctx, results) {
			showLoader();
			setTimeout(function(){
				if(results.rows.length == 0){
					$('#querylistsettings').html('No Help Queries Found.');          
					$('#querylistsettings').css({'margin-top':'30%','font-size':'20px','color':'#fff'});
					hideLoader();
					return 0;
				}

				var content = "";
				for(var support_row=0;support_row < results.rows.length; support_row++) {
					var value = results.rows.item(support_row);
					content +='<li><a href="#" onclick="return querydetails('+"'"+value.token2+"'"+')">'+value.subject+'<img src="images/listaee.png"></a></li>'
				}
				$('#querylist').html(content);
				hideLoader();
			},1000);
		});
	});
}

function db_querydetails(token2){
	$('#onquerypage').trigger('click');
    
    setTimeout(function(){
    	$("#support_idd").val(token2);
    },1000);
    
    var sqlite = 'SELECT * FROM support WHERE token2 = "'+token2+'"';
    db.transaction(function(tx) {
		tx.executeSql(sqlite, [], function(tx, results) {
			if(results.rows.length == 0){
				return 0;
			}
			
			var support = results.rows.item(0);
			sqlite = "SELECT `c`.*, `t`.`fname` FROM (`conversation` as c) LEFT JOIN `trainer` as t ON `c`.`sender_id` = `t`.`id` WHERE `c`.`support_token2` = '"+token2+"' ORDER BY `c`.`id` asc";
			db.transaction(function(ctx) {
				ctx.executeSql(sqlite, [], function(ctx, cresults) {
					showLoader();
					setTimeout(function(){
						var content = "";
						var me = 0;
						var trainee_id =  window.localStorage.getItem('userlogin');

						for(var c_row=0;c_row < cresults.rows.length; c_row++) {
							var value = cresults.rows.item(c_row);
							content +='<li >'; 
							if(( value.send_by == '3' || value.send_by == '3.0' ) && value.sender_id == trainee_id){
								content += '<div class="by_trainee">'+value.message+'</div></li>';
							}else{
								content += '<div class="by_trainer">'+value.message+'<!-- <br><span>'+value.fname+'</span>--></div></li>';
							} 
							content +='</li>'; 
						}

						$('#querydetails').html(support.message);
						$('#replylist').html(content);
						$("#replylist").scrollTop(5000);
						hideLoader();
					},1000);
				});
			});
		});
	});
}

function db_userimage(){
	var trainee_id =  window.localStorage.getItem('userlogin');
	var sqlite = 'SELECT * FROM trainee WHERE id = '+trainee_id;
    db.transaction(function(tx) {
		tx.executeSql(sqlite, [], function(tx, results) {
			if(results.rows.length == 0){
				$('#proimage').attr('src','images/user.jpg');
				return 0;
			}
			
			var trainee = results.rows.item(0);
			if(trainee.base64image != '' && trainee.base64image != '0'){
				$('#proimage').attr('src', trainee.base64image);
			}
			else{
				$('#proimage').attr('src', no_image);
			}
		});
	});
}

function db_addQuery(){
	var trainee_id =  window.localStorage.getItem('userlogin');
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

		var trainee_id = window.localStorage.getItem('userlogin');
		var trainer_id = window.localStorage.getItem('trainer_id');
		var user_fullname = window.localStorage.getItem('user_fullname');
		var userinfo = JSON.parse(window.localStorage.getItem('userinfo'));
		var useremail = userinfo.email;
		var token2 = get_token();
		var created = date('Y-m-d H:i:s');
		var lastupdated = get_timestamp();

		db.transaction(function(tx) {
			tx.executeSql("insert into support(subject, message, trainee_id, trainer_id, trainee_name, trainee_email, token2, by, status, is_read, created, lastupdated) values(?,?,?,?,?,?,?,?,?,?,?,?)", [sub, msg, trainee_id, trainer_id, user_fullname, useremail, token2, '2', '1', '0', created, lastupdated], function(tx, results){
				var lastInsertId = results.insertId;
				db.transaction(function(ttx) {
					var token = get_timestamp()+'0'+lastInsertId;
					ttx.executeSql("update support set token = ? , lastupdated = ? where id = ?", [token, lastupdated, lastInsertId], function(ttx, results){
						if(isOnline()){
							$.ajax({
								type:'POST',
								url : apiUrl, 
								data: {
									'sub' : sub,
									'msg' : msg,
									'trainee_id' : trainee_id,
									'trainer_id' : trainer_id,
									'trainee_name' : user_fullname,
									'trainee_email' : useremail,
									'token2' : token2,
									'lastupdated' : lastupdated,
									'created' : created,
									'method' : 'db_addquery'
								}    
							});
						}
						$('#onhelppage').trigger('click');
					});
				},dbError);
			})
		});
	}
}

function db_trainee_reply(){
	var support_idd = $("#support_idd").val();
	var trainee_id = window.localStorage.getItem('userlogin');
	var message = $("#reply_input").val();
	var lastupdated = get_timestamp();
	var token = get_token();
	var created = date('Y-m-d H:i:s');

	if(message == ''){
		showAlert('Please enter your message.');
	}else{
		$("#reply_input").val('');
		
		db.transaction(function(tx) {
			tx.executeSql("insert into conversation(message, support_token2, sender_id, send_by, recieve_by, created, token, lastupdated) values(?,?,?,?,?,?,?,?)", [message, support_idd, trainee_id, '3', '2', created, token, lastupdated], function(tx, results) {
				if(isOnline()){
					$.ajax({
						type:'POST',
						url : apiUrl, 
						data: {
							'message' : message,
							'support_token2' : support_idd,
							'sender_id' : trainee_id,
							'send_by' : '3',
							'recieve_by' : '2',
							'created' : created,
							'token' : token,
							'lastupdated' : lastupdated,
							'method' : 'db_trainee_reply'
						}    
					});
				}
				db_querydetails(support_idd);
			});
		});
	}
}

function db_updateAccountInfo(){
	var fname = $('#ufname').val();
	var lname = $('#ulname').val();
	var email = $('#uemail').val();
	var height = $('#height').val();
	var currentweight = $('#currentweight').val();
	var goalweight = $('#goalweight').val();

	var city = $('#ucity').val();
	var address = $('#uaddress').val();
	var trainee_id = $('#trainee_id').val();
	var img = $('#imgstr').val();

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

	if(flag == 1){
		var iinfo = window.localStorage.getItem('userinfo');  
		var a = JSON.parse(iinfo);
		if(email != a.email){
			if(!(isOnline())){
				if(img == ''){
					db.transaction(function(tx) {
						tx.executeSql("update trainee set fname = ? , lname = ? , currentweight = ? , height = ? , goalweight = ? , updated = ? , lastupdated = ? where id = ?", [fname, lname, currentweight, height, goalweight, date('Y-m-d H:i:s'), get_timestamp(), trainee_id], function(tx, results){
							showAlert('Profile updated.\nBut your email will update when you connect to internet.');
							setTimeout(function(){
								update_profile_on_server();
							},1000);
						});
					});
				}
				else{
					db.transaction(function(tx) {
						tx.executeSql("update trainee set fname = ? , lname = ? , base64image = ? , newimage = ? , currentweight = ? , height = ? , goalweight = ? , updated = ? , lastupdated = ? where id = ?", [fname, lname, "data:image/jpeg;base64,"+img, img , currentweight, height, goalweight, date('Y-m-d H:i:s'), get_timestamp(), trainee_id], function(tx, results){
							showAlert('Profile updated.\nBut your email will update when you connect to internet.');
							setTimeout(function(){
								update_profile_on_server();
							},1000);
						});
					});
				}
			}
			else{
				$.ajax({
					type:'POST',
					url : apiUrl, 
					data: {
						'trainee_id' : trainee_id,
						'email' : email,
						'method' : 'db_check_email'
					},
					beforeSend:function(){        
						showLoader();
					},
					complete:function(){        
						hideLoader();
					},
					success : function(res){
						var result = JSON.parse(res);
						if(result.flag){
							if(img == ''){
								db.transaction(function(tx) {
									tx.executeSql("update trainee set fname = ? , lname = ? , email = ?, currentweight = ? , height = ? , goalweight = ? , updated = ? , lastupdated = ? where id = ?", [fname, lname, email, currentweight, height, goalweight, date('Y-m-d H:i:s'), get_timestamp(), trainee_id], function(tx, results){
										showAlert('Profile updated.');
										setTimeout(function(){
											update_profile_on_server();
										},1000);
									});
								});
							}
							else{
								db.transaction(function(tx) {
									tx.executeSql("update trainee set fname = ? , lname = ? , email = ?, base64image = ? , newimage = ? , currentweight = ? , height = ? , goalweight = ? , updated = ? , lastupdated = ? where id = ?", [fname, lname, email, "data:image/jpeg;base64,"+img, img , currentweight, height, goalweight, date('Y-m-d H:i:s'), get_timestamp(), trainee_id], function(tx, results){
										showAlert('Profile updated.');
										setTimeout(function(){
											update_profile_on_server();
										},1000);
									});
								});
							}
						}
						else{
							showAlert('Email is already exist.');
							return 0;
						}
					}   
				});
			}
		}
		else{
			if(img == ''){
				db.transaction(function(tx) {
					tx.executeSql("update trainee set fname = ? , lname = ? , currentweight = ? , height = ? , goalweight = ? , updated = ? , lastupdated = ? where id = ?", [fname, lname, currentweight, height, goalweight, date('Y-m-d H:i:s'), get_timestamp(), trainee_id], function(tx, results){
						showAlert('Profile Updated.');
						setTimeout(function(){
							update_profile_on_server();
						},1000);
					});
				});
			}
			else{
				db.transaction(function(tx) {
					tx.executeSql("update trainee set fname = ? , lname = ? , base64image = ? , newimage = ? , currentweight = ? , height = ? , goalweight = ? , updated = ? , lastupdated = ? where id = ?", [fname, lname, "data:image/jpeg;base64,"+img, img , currentweight, height, goalweight, date('Y-m-d H:i:s'), get_timestamp(), trainee_id], function(tx, results){
						showAlert('Profile Updated.');
						setTimeout(function(){
							update_profile_on_server();
						},1000);
					});
				});
			}
		}
	}
}

function update_profile_on_server(){
	if(isOnline()){
		updateSessioninfo();
		var trainee_id =  window.localStorage.getItem('userlogin');
		var sqlite = "SELECT * FROM trainee WHERE id = ?";
		
		db.transaction(function(ctx) {
			ctx.executeSql(sqlite, [trainee_id], function(ctx, results) {
				if(results.rows.length == 0){
					return 0;
				}
				var trainee = results.rows.item(0);
				$.ajax({
					type:'POST',
					url : apiUrl, 
					data: {
						'trainee_id' : trainee_id,
						'image' : trainee.image,
						'fname' : trainee.fname,
						'lname' : trainee.lname,
						'newimage' : trainee.newimage,
						'updated' : trainee.updated,
						'lastupdated' : trainee.lastupdated,
						'email' : trainee.email,
						'currentweight' : trainee.currentweight,
						'height' : trainee.height,
						'goalweight' : trainee.goalweight,
						'method' : 'db_update_trainee_profile'
					}   
				});
			});
		});
	}
	else{
		updateSessioninfo();
	}
}

function db_updateSessioninfo(){
	var trainee_id =  window.localStorage.getItem('userlogin');
	var sqlite = "SELECT * FROM trainee WHERE id = ?";
	
	db.transaction(function(ctx) {
		ctx.executeSql(sqlite, [trainee_id], function(ctx, results) {
			if(results.rows.length == 0){
				return 0;
			}
			var info = results.rows.item(0);
			var userid = info.id;
          	window.localStorage.setItem('userlogin', userid);
			window.localStorage.setItem('user_fullname', info.fname+' '+info.lname);          
			var userinfo = JSON.stringify(info);          
			window.localStorage.setItem('userinfo', userinfo);
		});
	});
}

$(document).on('change', 'select.s_new_values', function(){
	var par = $(this).parent();
	
	var iElem = par.find('i');
	iElem.removeClass('red');
	iElem.removeClass('green');

	var orgVal = parseInt(par.find('input.original_value').val());
	
	var val = parseInt($(this).val());

	iElem.html(val);

	var parID = par.attr('id');
	var temp = parID.split('_');
	var set_id = temp[1];
	

	if(orgVal > val){
		iElem.addClass('red');
	}
	else if(orgVal < val){
		iElem.addClass('green');
	}

	if(temp[0] == 'w'){
		$(".res_set_"+set_id).find('.wselect').val(val);
	}
	else if(temp[0] == 'r'){
		$(".res_set_"+set_id).find('.rselect').val(val);
	}
	else{
		$(".res_set_"+set_id).find('.tselect').val(val);
		iElem.html(sec_to_min(val));
	}
});

function on_off_n_p_btn(){
	var monthh = parseInt(window.localStorage.getItem('monthh'));
	var yearr = parseInt(window.localStorage.getItem('yearr'));
	
	var currenttDatee = new Date();
	var cm = currenttDatee.getMonth() + 1;
	var cy = currenttDatee.getFullYear();
	var nm = date("n", strtotime("+1 month"));
	var ny = date("Y", strtotime("+1 month"));
	var pm = date("n", strtotime("-1 month"));
	var py = date("Y", strtotime("-1 month"));

	if(monthh == nm && yearr == ny){
		// $("#n_month_btn").attr('onclick', 'return false;');
		// $("#n_month_btn").html('BB');
	}
	else{
		$("#n_month_btn").attr('onclick', 'next_month();');
		$("#n_month_btn").css('opacity', '1');
	}

	if(monthh == pm && yearr == py){
		// $("#p_month_btn").attr('onclick', 'return false;');
		// $("#p_month_btn").html('BB');
	}
	else{
		$("#p_month_btn").attr('onclick', 'prev_month();');
		$("#p_month_btn").css('opacity', '1');
	}

	// alert('monthh ' + monthh + '\nnm ' + nm + '\nyearr ' + yearr + '\nny ' + ny );
}

function sec_to_min(seconds){
	seconds = parseInt(seconds);
	
	if(seconds == NaN)
		seconds = 0;

	if(seconds <= 59){
		return seconds + 's';
	}
	else if( seconds > 59 ){
		var min = parseInt(seconds / 60);
		var sec = seconds % 60;

		var res = '';
		res += min;
		res += 'm ';
		
		if(sec > 0){
			res += sec;
			res += 's';
		}
		return res;
	}
	else{
		return seconds;
	}
}