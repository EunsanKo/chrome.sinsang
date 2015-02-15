function run() {
  	
	idbSupported = false;
	db = '';    
	var db_version = 1;
	var db_name = "everytopic";
	if("indexedDB" in window) {
	    idbSupported = true;
	}

	var createDB = function(callback){
		if(idbSupported) {

		    var openRequest = indexedDB.open(db_name,db_version);

		    openRequest.onupgradeneeded = function(e) {
		        console.log("Upgrading...");
		        db = e.target.result;
		        store = db.createObjectStore("topics", { keyPath: ["date", "type"] });
		        store.createIndex("key", ["date", "type"], { unique: true });
		        store.createIndex("date", "date", { unique: false });
			    
				
		    }

		    openRequest.onsuccess = function(e) {
		        console.log("Success!");
		        db = e.target.result;
		        callback();
		    }

		    openRequest.onerror = function(e) {
		        console.log("Error");
		        console.dir(e);
		    }
		}
	}
	

	var clearDB = function(){
		if(idbSupported) {
			console.log(db);

			if(db){
				db.close();
				db="";
			}
			var req = indexedDB.deleteDatabase(db_name);
			req.onsuccess = function () {
			    console.log("Deleted database successfully");
			    layer_open('layer2', '삭제되었습니다.',false);
			};
			req.onerror = function () {
			    console.log("Couldn't delete database");
			};
			req.onblocked = function () {
			    console.log("Couldn't delete database due to the operation being blocked");
			    layer_open('layer2', '삭제되었습니다.',false);
			};
		}

	}

	var createAndSave = function(){
		if(!db){
			createDB(saveTopicData);
		}else{
			saveTopicData();
		}
	}

	var saveTopicData = function() {
		console.log("Here is the database:"+ db);
		var date = getDate();
		var tx = db.transaction("topics", "readwrite");
		var store = tx.objectStore("topics");
		console.log(category_data);
		store.put({"date":date, "type": "hot", "datas": hottopic_data});
		store.put({"date":date, "type": "cate", "datas": category_data});
		store.put({"date":date, "type": "pcgame", "datas": pcgame_data});
		store.put({"date":date, "type": "relate", "datas": relatekey_data});
		
		tx.oncomplete = function() {
		  // All requests have succeeded and the transaction has committed.
		  
		  
		  layer_open('layer2', '저장되었습니다.',false);
		};
	};


	var showAllSaveData = function(){
		if(!db){
			createDB(showDatas);
		}else{
			showDatas();
		}
	}
	
	var savedDataSelectOption = {};

	var showDatas = function(){
		viewToggle();
		savedDataSelectOption={};
		var tx = db.transaction("topics", "readonly");
		var store = tx.objectStore("topics");
		
		var index = store.index("date");

		var request = index.openCursor();
		request.onsuccess = function() {
		  var cursor = request.result;
		  
		  if (cursor) {
		    // Called for each matching record.
		    
		    

		    savedDataSelectOption[cursor.value.date]=cursor.value.date;
		    cursor.continue();
		  } else {
		    // No more matching records.
			
			var option="<option>::선택::</option>";
			for(var key in savedDataSelectOption){
				option+="<option value='"+key+"'>"+key+"</option>";
			}
			$('#savedSelect').html(option);
		  }
		  
		};
		



	}

	

	var getDataByDate = function(date){
		var tx = db.transaction("topics", "readonly");
		var store = tx.objectStore("topics");
		var index = store.index("date");

		var request = index.openCursor(IDBKeyRange.only(date));
		request.onsuccess = function() {
		  var cursor = request.result;
		  if (cursor) {
		    // Called for each matching record.
		    
		    
		    var val = cursor.value;

		    if(val.type=='hot'){
		    	savedHotTopicParsing(val);
		    }else if(val.type=='cate'){
		    	savedCategoryParsing(val);
		    }else if(val.type=='pcgame'){
		    	savedGameParsing(val);
		    }else if(val.type=='relate'){
		    	savedRelatedKeyworParsing(val);
		    }
		    cursor.continue();

		  } else {
		    // No more matching records.
		  }
		};
	}

	
	

	function layer_open(el,content,flag){
		var confirmBtn = $('#confirm');
		confirmBtn.hide();
		var temp = $('#' + el);
		$('#popupContent').html(content);
		var bg = temp.prev().hasClass('bg');

		if(bg){
			$('.layer').fadeIn();
		}else{
			temp.fadeIn();
		}

		if (temp.outerHeight() < $(document).height() ) temp.css('margin-top', '-'+temp.outerHeight()/2+'px');
		else temp.css('top', '0px');
		if (temp.outerWidth() < $(document).width() ) temp.css('margin-left', '-'+temp.outerWidth()/2+'px');
		else temp.css('left', '0px');

		temp.find('#close').click(function(e){
			if(bg){
				$('.layer').fadeOut();
			}else{
				temp.fadeOut();
			}
			e.preventDefault();
		});
		
		if(flag){
			confirmBtn.show();
			confirmBtn.click(function(e){
				if(bg){
					$('.layer').fadeOut();
				}else{
					temp.fadeOut();
				}
				clearDB();
				e.preventDefault();
			});
		}
		
		$('.layer .bg').click(function(e){
			$('.layer').fadeOut();
			e.preventDefault();
		});

		setTimeout(function(){
			$('.layer').fadeOut();
		},2000);
	}		

 	

	var saveAllData = function() { 
		createAndSave();
	}

	var scrollheight = 40;

	

	var getChromedImageUrl = function(url,callback){
		var xhr = new XMLHttpRequest();
		xhr.open('GET',url , true);
		xhr.responseType = 'blob';
		xhr.onload = function(e) {
		  
		  
		  callback(window.URL.createObjectURL(this.response))
		};

		xhr.send();
	}
	

	var ajax = function(options, callback) {
	  var xhr;
	  xhr = new XMLHttpRequest();
	  xhr.open(options.type, options.url, options.async || true);
	  xhr.onreadystatechange = function() {
	    if (xhr.readyState === 4) {
	      return callback(xhr.responseText);
	    }
	  };
	  return xhr.send();
	};


	var callAjax = function(target,callback){
		ajax({type:"GET", url:target},function(result){
			//result = result.replace(/<img/gi,'<div');
			callback(result);
		});
	}

	
    


    var product_template = function(shop,nm,opr,dpr,link,img){
    	var template_html = '<div class="portfolio '+shop+'" data-cat="'+shop+'">'
						 + '    <div class="portfolio-wrapper">'      
						 + '       <a target="_blank" href='+link+'>'
						 + '     	  <img src="'+img+'" alt="" />'
						 + '       </a>'
						 + '       <div class="label">'
						 + '           <div class="label-text">'
						 + '             <span class="text-category">'+SINSANG_SITES[shop].name+'</span>'
						 + '             <a class="text-title">'+nm+'</a>'
						 + '             <span class="text-category">'+(!opr?('판매가: '+dpr):('원가:'+opr+'/ 할인가:'+dpr))+'</span>'
						 + '           </div>'
						 + '           <div class="label-bg"></div>'
						 + '         </div>'
						 + '       </div>'
						 + '     </div>';
		return template_html;
    }

	var uptownholic_parsing = function(result){
		var table = $(result).find('table.product_table');
		$.each(table,function(inx,product){
			var linkAndImage = $(product).find('td.Brand_prodtHeight').find('a');
			
			var product_name = $(product).find('.brandbrandname').contents().filter(function() {
			    return (this.nodeType === 3&&this.data!== ' '); //Node.TEXT_NODE
			  });
			var original_price = $(product).find('span.mk_price').html();
			var discount_price = $(product).find('div.mk_brand_discount_price').text();
			var link = SINSANG_SITES["uptownholic"].base_url+linkAndImage.attr('href');
			var img = SINSANG_SITES["uptownholic"].base_url+linkAndImage.find('div').attr('src');
			
			getChromedImageUrl(img,function(chromed_img_url){
				var html = product_template('uptownholic',product_name.text(),original_price,discount_price,link,chromed_img_url);
				$('#portfoliolist').append(html);
				//filterList.init();
			})
		});
	};

	var miamasvin_parsing = function(result){
		
		var products = $(result).find('ul.prdList').find('li').find('.box');


		$.each(products,function(inx,product){
			var linkAndImage = $(product).find('a');
			
			var product_name = $(product).find('p.name').find('span').html();
			
			var original_price = $(product).find('ul.xans-element-').find('li.xans-record-').find('span[style="font-size:11px;color:#555555;text-decoration:line-through;"]').html();
			var discount_price = $(product).find('ul.xans-element-').find('li.xans-record-').find('span[style="font-size:11px;color:#555555;"]').last().html();
			
			var link = SINSANG_SITES["miamasvin"].base_url+linkAndImage.attr('href');
			var img = linkAndImage.find('div').attr('src');
			
			

			getChromedImageUrl(img,function(chromed_img_url){
				var html = product_template('miamasvin',product_name,original_price,discount_price,link,chromed_img_url);
				$('#portfoliolist').append(html);
				//filterList.init();
			})
		});
	}

	var naingirl_parsing = function(result){
		
		var products = $(result).find('form').children('table').last().find('td.main_name_td').parent().parent();
		$.each(products,function(inx,product){

			var linkAndImage = $(product).children().first();
			var product_name = $(product).find('td.main_name_td').text();
			var price_parent = $(product).children().last();
			var original_price = $(price_parent).find('.mk_price').html();
			var discount_price = $(price_parent).find('.mk_brand_discount_price').find('span').html();
			
			var link = SINSANG_SITES["naingirl"].base_url+linkAndImage.find('a').attr('href');
			var img = linkAndImage.find('div').attr('src');
			
			/*console.log(product_name);
			console.log(original_price);
			console.log(discount_price);
			console.log(link);
			console.log(img);*/

			getChromedImageUrl(img,function(chromed_img_url){
				var html = product_template('naingirl',product_name,original_price,discount_price?discount_price:original_price,link,chromed_img_url);
				$('#portfoliolist').append(html);
				//filterList.init();
			})
		});
	}

	var bubblenchic_parsing = function(result){
		
		var products = $(result).find('tr[bgcolor]').last().parent().children().first().children();
		
		
		$.each(products,function(inx,product){

			var linkAndImage = $(product).find('td').first();
			
			var product_name = $(product).find('font').html();
			
			
			var original_price = undefined;
			var discount_price = $(product).find('.view_sale_price').html();
			
			var link = SINSANG_SITES["bubblenchic"].base_url+linkAndImage.find('a').attr('href');
			var img = linkAndImage.find('div').attr('src');
			
			/*console.log(product_name);
			console.log(original_price);
			console.log(discount_price);
			console.log(link);
			console.log(img);*/

			getChromedImageUrl(img,function(chromed_img_url){
				var html = product_template('bubblenchic',product_name,original_price,discount_price,link,chromed_img_url);
				$('#portfoliolist').append(html);
				//filterList.init();
			})
		});
	}

	var mayblue_parsing = function(result){
		
		var products = $(result).find('td.td_top_vert').find('td').find('table');
		
		
		$.each(products,function(inx,product){

			var linkAndImage = $(product).find('tr').first();
			
			var product_name = $(product).find('b').html();
			
			
			var original_price = $(product).find('.mk_price').html();
			var discount_price = $(product).find('.mk_brand_discount_price').text();
			
			var link = SINSANG_SITES["mayblue"].base_url+linkAndImage.find('a').attr('href');
			var img = linkAndImage.find('div').attr('src');
			
			/*console.log(product_name);
			console.log(original_price);
			console.log(discount_price);
			console.log(link);
			console.log(img);*/
			
			getChromedImageUrl(img,function(chromed_img_url){
				var html = product_template('mayblue',product_name,original_price,discount_price,link,chromed_img_url);
				$('#portfoliolist').append(html);
				//filterList.init();
			})
		});
	}

    var SINSANG_SITES = {
    	uptownholic : {url:"http://www.uptownholic.com/shop/shopbrand.html?xcode=018&type=P",
    				   base_url:"http://www.uptownholic.com",
    				   name:"UPTOWNHOLIC",
                       cb : uptownholic_parsing},
        miamasvin 	: {url:"http://www.miamasvin.co.kr/product/list_100.html?cate_no=125",
        			   base_url :"http://www.miamasvin.co.kr",
        			   name:"Miamasvin",
                       cb : miamasvin_parsing},
        naingirl 	: {url:"http://www.naingirl.com/shop/shopbrand.html?xcode=198",
        			   base_url :"http://www.naingirl.com",
                       name:"NAINGIRL",
                       cb : naingirl_parsing},
        bubblenchic : {url:"http://www.bubbleandchic.co.kr/Front/Product/?url=Category&cate_no=BD000000",
        			   base_url :"http://www.bubbleandchic.co.kr",
                       name:"BUBBLE N CHIC",
                       cb : bubblenchic_parsing},
        mayblue 	: {url:"http://www.mayblue.co.kr/shop/shopbrand.html?xcode=041&type=P",
        			   base_url :"http://www.mayblue.co.kr",
                       name:"mayblue",
                       cb : mayblue_parsing},

	}


	var uptownholic_data = {};
  	var miamasvin_data = {};
  	var suaegirl_data = {};
  	

	var callSinsangUrl = function(shopName){


		var url  = SINSANG_SITES[shopName].url;
		var cb = SINSANG_SITES[shopName].cb;
		
		ajax({type:"GET", url:url},function(result){
			result = result.replace(/<img/gi,'<div');
			
			cb(result);
		});

	}
	

	var sync = function(){
		$('#status').show();
		$("#portfoliolist").remove();
		$('#portcont').append("<div id='portfoliolist'></div>")
		callSinsangUrl("uptownholic");
		callSinsangUrl("miamasvin");
		callSinsangUrl("naingirl");
		callSinsangUrl("bubblenchic");
		callSinsangUrl("mayblue");

		setTimeout(function(){
			filterList.init();
			$('#status').hide();
		},6000)
	}
	
	sync();
	

	
	

  	
	  // on result from sandboxed frame:
  	window.addEventListener('message', function(event) {
  		var time = event.data.time;
  		var html = event.data.result;  		
	});
	

  	function getDate(){
		var d = new Date();
		return d.getFullYear()+(((d.getMonth()+1))>9?(d.getMonth()+1):"0"+(d.getMonth()+1))+(d.getDate()>9?d.getDate():"0"+d.getDate());
	}

	function getDay(t){
		var d = new Date();
		return d.getFullYear()+"-"+(((d.getMonth()+1))>9?(d.getMonth()+1):"0"+(d.getMonth()+1))+"-"+(d.getDate()>9?d.getDate():"0"+d.getDate())+" "+(t==undefined?d.getHours():t)+":"+(t==undefined?d.getMinutes():'00')+":"+(t==undefined?d.getSeconds():'00');
	}

	function getLeftTime(t){
		var current = getDay();
		var timeTitle = getDay(t);
		
		var cd = new Date(current);

		var td = new Date(timeTitle);
		
		var timeGap = Math.floor((td.getTime()-cd.getTime()) / (1000 * 60  ));
		
		var h = Math.floor(timeGap/60);
		var m = timeGap%60;
		
		return (h+"시간 "+m+" 분 남았습니다");
		
	}

	
	
	var win = chrome.app.window.current();

	


	$('#top').on('click',function(a){
		
		console.log($('#top').hasClass("btn-default"));

		if($('#top').hasClass("btn-default")){
			win.setAlwaysOnTop(true);
			$('#top').removeClass("btn-default");
			$('#top').addClass("btn-warning");
		}else{
			win.setAlwaysOnTop(false);
			$('#top').removeClass("btn-warning");
			$('#top').addClass("btn-default");

		}

	});

	

	$('#sync').on('click',function(){
		sync();
	});

	
	$('[data-toggle="tooltip"]').tooltip();   
	
	$('#close').on('click',function(){
		window.close();
	});

	

};



chrome.app.window.onBoundsChanged.addListener(run);

onload = run;