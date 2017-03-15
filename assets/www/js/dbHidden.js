function syncDBHidden(tx){
	var sqlite;
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

	syncConversationHidden();
	syncSupportHidden();
	syncTraineeHidden();
	syncTrainerHidden();
	syncTraineeWorkoutHidden();
	syncWorkoutHidden();
	syncExerciseHidden();
	syncCircuitHidden();
	syncExerciseSetHidden();
	syncWorkoutNotesHidden();
	syncExerciseNotesHidden();
	syncExerciseSetResultsHidden();
}

function sync_dbHidden(){
	var loginsession = window.localStorage.getItem("userlogin");
	if(isOnline() && loginsession){
		db.transaction(syncDBHidden,dbError);
	}
}

function syncConversationHidden() {
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
					}else{
						// showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncSupportHidden() {
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
					}else{
						// showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncTraineeHidden() {
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
											insertBase64ImageHidden(id, image, tablename);

											updateSessioninfo();

										// },dbError);
									});
								},dbError);
							});
						}
					}else{
						// showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncTrainerHidden() {
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
					}else{
						// showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncTraineeWorkoutHidden() {
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
					}else{
						// showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncWorkoutHidden() {
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

	// "select * from workout where trainer_id = ? AND date LIKE '%-"+curentMonth+"-%'"
	// alert(sqlite);

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
											insertBase64ImageHidden(id, image, tablename);

											/*
											if( (ob.circuit_image != '') && (ob.type == '2' || ob.type == '2.0') ){
												insertCBase64ImageHidden(id, ob.circuit_image, tablename, 'cbase64image');
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
					}else{
						// showAlert(res.error);
					}
				}
			});
		})
	},dbError);
}

function syncExerciseHidden() {
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

	// "select * from workout where trainer_id = ? AND date LIKE '%-"+curentMonth+"-%'"
	
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

			var where = '';

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
					}

					var syncData = syncData.join('__----__');

					$.ajax({
						method : 'POST',
		      			url : apiUrl,
						data : { 'method' : 'sync_exercise' , 'trainer_id' : trainer_id , 'syncData' : syncData },
						type : 'POST',
						success : function(resp){

							// alert(resp);

							res = JSON.parse(resp);

							if(res.success){
								var response = res.success.data;
								if(response){	
									$.each(response, function(index, ob){
										// alert(ob.token);
										db.transaction(function(ctx) {
											ctx.executeSql("delete from exercise where id = ?", [ob.id], function(ctx) {
												// db.transaction(function(ptx) {
													ctx.executeSql("insert into exercise(id, notes, workout_id, name, description, timetaken, resttime, image, base64image, status, created, updated, lastupdated, token, circuit_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [ob.id, ob.notes, ob.workout_id, ob.name, ob.description, ob.timetaken, ob.resttime, ob.image, ob.base64image, ob.status, ob.created, ob.updated, ob.lastupdated, ob.token, ob.circuit_id]);
													
													var id = ob.id;
													// var image = './assets/uploads/exercise/'+ob.image;
													var image = ob.image;
													var tablename = 'exercise';
													insertBase64ImageHidden(id, image, tablename);

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
							}else{
								// showAlert(res.error);
							}
						}
					});
				})
			},dbError);

		})
	},dbError);
}

function syncCircuitHidden() {
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
													insertBase64ImageHidden(id, image, tablename);

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
							}else{
								// showAlert(res.error);
							}
						}
					});
				})
			},dbError);

		})
	},dbError);
}

function syncExerciseSetHidden() {
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

	// "select * from workout where trainer_id = ? AND date LIKE '%-"+curentMonth+"-%'"
	
	
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
								}else{
									// showAlert(res.error);
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

function syncWorkoutNotesHidden() {
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
					}
				}
			});
		})
	},dbError);
}

function syncExerciseNotesHidden() {
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
					}
				}
			});
		})
	},dbError);
}

function syncExerciseSetResultsHidden() {
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
					}
				}
			});
		})
	},dbError);
}

function insertCBase64ImageHidden(id, image, tablename, fieldname){
	$.ajax({
		url : apiImageConvertUrl,
		type : 'POST',
		data : { 'image' : image },
		success : function(resp){
			if(resp.base64image){
				db.transaction(function(utx) {
					utx.executeSql("update "+tablename+" set "+fieldname+" = ? where id = ?", [resp.base64image, id], function(){
							
					});
				},dbError);
			}
		}
	});
}

function insertBase64ImageHidden(id, image, tablename){
	$.ajax({
		url : apiImageConvertUrl,
		type : 'POST',
		data : { 'image' : image },
		success : function(resp){
			if(resp.base64image){
				db.transaction(function(utx) {
					utx.executeSql("update "+tablename+" set base64image = ? where id = ?", [resp.base64image, id], function(){
							
					});
				},dbError);
			}
		}
	});
}