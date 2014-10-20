Linkify Plus Plus
=================
An user script which can linkify almost everything. Base on Linkify Plus.

Install
-------
[Greasy Fork](https://greasyfork.org/scripts/4255-linkify-plus-plus).

Testcase
--------
<https://rawgit.com/eight04/linkify-plus-plus/master/testcase.html>

Changelog
---------
* Version 2.3.22 (Oct 20, 2014):
	- Add ".brush:" to ignore list.
* Version 2.3.21 (Sep 30, 2014):
	- Fix: max node limits...
* Version 2.3.20 (Sep 29, 2014):
	- Enhance: Increase performance.
* Version 2.3.19 (Sep 29, 2014):
	- Fix: Reduce node limits.
* Version 2.3.18 (Sep 18, 2014):
	- Fix: Add h* tags into ignore list.
* Version 2.3.17 (Sep 16, 2014):
	- Enhance: Delay the script execution if there are too many nodes.
* Version 2.3.16 (Sep 15, 2014):
	- Enhance: Use better config style.
* Version 2.3.15 (Sep 15, 2014):
	- Fix: Grant bug (again)
* Version 2.3.14 (Sep 15, 2014):
	- Add: GM_config. Deside whether to display image.
* Version 2.3.13 (Sep 15, 2014):
	- Fix: Remove <wbr> before linkify.
* Version 2.3.12 (Sep 9, 2014):
	- Fix: Angular conflict. Check "{{ }}" pairs.
* Version 2.3.11 (Sep 7, 2014):
	- Enhance: add isIP function.
* Version 2.3.10 (Sep 7, 2014):
	- Enhance: Use better ip detection
* Version 2.3.9 (Sep 7, 2014):
	- Fix: Add domain check for ip numbers.
	- Fix: Add domain check ".." invalid.
* Version 2.3.8 (Sep 6, 2014):
	- Fix: Push to event queue to avoid Angular conflict. It should work on most of pages.
* Version 2.3.7 (Sep 6, 2014):
	- Fix: Match port and hyphen in domain.
* Version 2.3.6 (Sep 4, 2014):
	- Fix: Angular conflict.
* Version 2.3.5 (Sep 3, 2014):
	- Remove image when loading failed.
	- Remove debug code.
* Version 2.3.4 (Sep 3, 2014):
	- Since FF 32 have some problem dealing with unicode, use a new path RE.
* Version 2.3.3 (Sep 2, 2014):
	- Add svg and some new tags to ignore list.
* Version 2.3.2 (Sep 2, 2014):
	- Add ttp:// -> http:// alia.
	- Use TLD list!
* Version 2.3.1 (Sep 1, 2014):
	- Move class tester into xpath.
* Version 2.3 (Sep 1, 2014):
	- Match to a pretty large set. Check readme for detail.
* Version 2.2.2 (Aug 26, 2014):
	- Add .code to ignore list.
* Version 2.2.1 (Aug 17, 2014):
	- Ignore .highlight container.
* Version 2.2 (Aug 15, 2014):
	- Add images support.
	- Use Observer instead of DOMNodeInserted.
* Version 2.1.4 (Aug 12, 2012):
	- Bug fix for when (only some) nodes have been removed from the document.
* Version 2.1.3 (Oct 24, 2011):
	- More excludes.
* Version 2.1.2:
	- Some bug fixes.
* Version 2.1.1:
	- Ignore certain "highlighter" script containers.
* Version 2.1:
	- Rewrite the regular expression to be more readable.
	- Fix trailing "." characters.
* Version 2.0.3:
	- Fix infinite recursion on X(HT)ML pages.
* Version 2.0.2:
	- Limit @include, for greater site/plugin compatibility.
* Version 2.0.1:
	- Fix aberrant 'mailto:' where it does not belong.
* Version 2.0:
	- Apply incrementally, so the browser does not hang on large pages.
	- Continually apply to new content added to the page (i.e. AJAX).
* Version 1.1.4:
	- Basic "don't screw up xml pretty printing" exception case
* Version 1.1.3:
	- Include "+" in the username of email addresses.
* Version 1.1.2:
	- Include "." in the username of email addresses.
* Version 1.1:
	- Fixed a big that caused the first link in a piece of text to be skipped (i.e. not linkified).


Linkify
-------
Loosely based on the Linkify script located at:
http://downloads.mozdev.org/greasemonkey/linkify.user.js


License
-------
Copyright (c) 2011, Anthony Lieuallen  
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Anthony Lieuallen nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
