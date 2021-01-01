// import type {ApiEditPageParams} from 'types-mediawiki/api_params';

function func() {
	return api({titles: 'oBama'}).then((json) => {
		console.log(json.qwe.er);
	});
}

function funcp() {
	return sleep().then(json => {
		console.log(json.qer.qw);
	});
}


function sleep() {
	return new Promise((rs, rj) => {
		setTimeout(rs, 1000);
	});
}


function api(query) {
	return new Promise((rs, rj) => {
		return new mw.Api().get(query).then(json => rs(json), err => rj(err));
	});
}

func();

$.Deferred();

// new mw.Api('er');

new mw.Api({})


mw.language.convertGrammar('e', 'er');

$().textSelection('getContents');



var keymap = {
	foobar: 3,
	barfoo: 4
}

function tester(arg: keyof typeof keymap) {
	console.log(arg);
}

tester('barfoo');
