/* eslint-env node */
/* eslint no-console: off */
'use strict';

var bbcode = require('./');

var testCases = [
	{
		name: 'basic formatting',
		input: '[b]bold[/b] [i]italic[/i] [u]underline[/u] [s]strikeout[/s] [sup]superscript[/sup] [sub]subscript[/sub] [left]left-alignment[/left] [center]center-alignment[/center] [right]right-alignment[/right]',
		expected: '<b>bold</b> <i>italic</i> <u>underline</u> <s>strikeout</s> <sup>superscript</sup> <sub>subscript</sub> <div class="align-left">left-alignment</div> <div class="align-center">center-alignment</div> <div class="align-right">right-alignment</div>'
	},
	{
		name: 'escaping',
		input: '[URL=http://example.com/&"]<>&[/URL]',
		expected: '<a href="http://example.com/&amp;&#34;" rel="external nofollow">&lt;>&amp;</a>'
	},
	{
		name: 'unsafe links',
		input: '[URL=javascript:alert(1)]click[/URL]',
		expected: '[URL=javascript:alert(1)]click[/URL]'
	},
	{
		name: 'internal links',
		input: '[url=/]click[/url]',
		expected: '<a href="/">click</a>',
	},
	{
		name: 'nested quotes',
		input: '[QUOTE="some user"]And then I came across something extraordinary: [QUOTE=example]red green blue orange yellow[/QUOTE] Perplexing![/QUOTE]',
		expected: '<blockquote><header><cite>some user</cite> wrote:</header> And then I came across something extraordinary: <blockquote><header><cite>example</cite> wrote:</header> red green blue orange yellow</blockquote> Perplexing!</blockquote>'
	},
	{
		name: 'bad nesting',
		input: '[b]foo [i]bar[/b] baz[/i]',
		expected: '<b>foo <i>bar</i></b><i> baz</i>'
	},
	{
		name: 'worse nesting',
		input: '[quote]one [b]two [quote]three[/b] four[/quote] five[/quote]',
		expected: '<blockquote>one <b>two <blockquote>three</blockquote></b><blockquote> four</blockquote> five</blockquote>'
	},
	{
		name: 'triple bad nesting',
		input: '[i]one [b]two [s]three[/i] four[/b] five[/s]',
		expected: '<i>one <b>two <s>three</s></b></i><b><s> four</s></b><s> five</s>'
	},
	{
		name: 'bad nesting involving bad tag',
		input: '[i]one [url=javascript:two]three[/i] four[/url]',
		expected: '<i>one [url=javascript:two]three</i> four[/url]'
	},
	{
		name: 'user links',
		input: ':iconexample: :exampleicon: :linkexample:',
		expected: '<a href="/users/example/"><img src="/users/example/image"> example</a> <a href="/users/example/"><img src="/users/example/image"></a> <a href="/users/example/">example</a>'
	},
	{
		name: 'automatic links',
		input: 'Have you visited http://example.com/?',
		expected: 'Have you visited <a href="http://example.com/" rel="external nofollow">http://example.com/</a>?'
	},
	{
		name: 'automatic links, internal',
		input: 'web https://furaffinity.net; CDN https://d.facdn.net/.',
		expected: 'web <a href="https://furaffinity.net">https://furaffinity.net</a>; CDN <a href="https://d.facdn.net/">https://d.facdn.net/</a>.'
	},
	{
		name: 'symbols',
		input: '(c) (C) (r) (R) (tm) (TM)',
		expected: '© © ® ® ™ ™'
	},
	{
		name: 'series navigation links',
		input: '[-, -, -] [1, 2, 3] [-, 2, 3] [1, 2, -]',
		expected: '&lt;&lt;&lt; PREV | FIRST | NEXT &gt;&gt;&gt; <a href="/submissions/1">&lt;&lt;&lt; PREV</a> | <a href="/submissions/2">FIRST</a> | <a href="/submissions/3">NEXT &gt;&gt;&gt;</a> &lt;&lt;&lt; PREV | <a href="/submissions/2">FIRST</a> | <a href="/submissions/3">NEXT &gt;&gt;&gt;</a> <a href="/submissions/1">&lt;&lt;&lt; PREV</a> | <a href="/submissions/2">FIRST</a> | NEXT &gt;&gt;&gt;'
	},
	{
		name: 'line breaks',
		input: 'one\r\ntwo',
		options: {
			automaticParagraphs: true
		},
		expected: '<p>one<br>two</p>'
	},
	{
		name: 'paragraphs',
		input: 'one\r\n\r\ntwo',
		options: {
			automaticParagraphs: true
		},
		expected: '<p>one</p><p>two</p>'
	},
	{
		name: 'paragraphs with extra line breaks',
		input: 'one\n\n\ntwo',
		options: {
			automaticParagraphs: true
		},
		expected: '<p>one</p><br><p>two</p>'
	},
	{
		name: 'forced line breaks',
		input: 'one\u2028\u2028two',
		options: {
			automaticParagraphs: true
		},
		expected: '<p>one<br><br>two</p>'
	},
	{
		name: 'forced paragraph breaks',
		input: 'one\u2029two',
		options: {
			automaticParagraphs: true
		},
		expected: '<p>one</p><p>two</p>'
	},
	{
		name: 'unnecessary nesting',
		input: '[b][b]extra-bold?[/b][/b]',
		expected: '<b>extra-bold?</b>'
	},
	{
		name: 'excessive nesting',
		input: '[quote]'.repeat(22) + '[/quote]'.repeat(22),
		expected: '<blockquote>'.repeat(21) + '[quote]' + '</blockquote>'.repeat(21) + '[/quote]',
	},
	{
		name: 'stranded closing tags',
		input: 'text[/b]',
		expected: 'text[/b]',
	},
	{
		name: 'no text',
		input: '',
		options: {
			automaticParagraphs: true
		},
		expected: '',
	},
	{
		name: 'horizontal rule inside text',
		input: 'a-----b',
		expected: 'a<hr>b'
	},
	{
		name: 'colors',
		input: '[color=limegreen]limegreen[/color]\n[color=ff0000]red[/color]\n[color=#00f]blue[/COLOR]\n[color=invalid]no[/color]',
		expected: '<span style="color: limegreen;">limegreen</span><br><span style="color: #ff0000;">red</span><br><span style="color: #00f;">blue</span><br>[color=invalid]no[/color]'
	},
];

function attempt(test) {
	var output = bbcode.render(test.input, test.options);

	if (output === test.expected) {
		console.log('\x1b[32m✔\x1b[0m \x1b[1m%s\x1b[0m passed', test.name);
		return true;
	}

	console.log('\x1b[31m✘\x1b[0m \x1b[1m%s\x1b[0m failed', test.name);
	console.log('  Output: ' + output);
	console.log('Expected: ' + test.expected);
	return false;
}

var allPassed = testCases.reduce(function (passing, test) {
	return attempt(test) && passing;
}, true);

if (!allPassed) {
	process.exit(1);
}
