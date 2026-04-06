/**

Viewer discretion is strongly advised. The content that follows may include
material that some viewers may find disturbing, offensive, or inappropriate
for certain audiences, including but not limited to strong language, explicit
references, graphic descriptions, or sensitive themes. This material is
intended for mature audiences and viewer judgment is recommended.

By continuing, you acknowledge that you understand the nature of the content
and choose to proceed at your own discretion. If you are sensitive to such
material or are in an environment where this type of content may be unsuitable,
it is recommended that you do not continue.

Please take a moment to ensure that you are comfortable proceeding. The
following section contains content that may not be appropriate for all viewers.















*/

package helpers

import (
	"regexp"
	"strings"
)

var similarCharacters = map[string]string{
	"-":  " ",
	"_":  " ",
	"4":  "a",
	"@":  "a",
	"8":  "b",
	"5":  "b",
	"(":  "c",
	"<":  "c",
	"cl": "d",
	"3":  "e",
	"ph": "f",
	"6":  "g",
	"9":  "g",
	"1":  "i",
	"!":  "i",
	"|":  "l",
	"i":  "l",
	"l":  "i",
	"0":  "o",
	"()": "o",
	"7":  "t",
	"$":  "s",
	"2":  "z",
	"u":  "v",
	"v":  "u",
}

var offensiveWords = []string{
	// english offensive words
	"f(u|o|oo|ri)?c?k",
	"shag",
	"frig",
	"suck",
	"throb",
	"slurp",
	"rap(e|ist)",
	"sex",
	"intercourse",
	"shit",
	"poop",
	"retard",
	"idi?ot",
	"moron",
	"cum",
	"facial",
	"ejaculate",
	"squirt",
	"copulate",
	"baby\\s?batter",
	"ball\\s?gravy",
	"semen",
	"jizz",
	"piss",
	"pee",
	"ass",
	"anus",
	"anal",
	"arse",
	"crack",
	"genital",
	"dick",
	"schlong",
	"dildo",
	"penis",
	"[ck]ock",
	"[ck]ondum",
	"vibrat[eo]r",
	"cox\\s?[sz]uck",
	"cuck",
	"penile",
	"erection",
	"testes",
	"ball\\s?sack",
	"nut\\s?sack",
	"testicle",
	"vag",
	"clit",
	"c[un][nu]t",
	"pussy",
	"pub(e|ic)",
	"boob",
	"breast",
	"tit",
	"nipple",
	"pant(y|i|ee|ie)",
	"bra",
	"blowjob",
	"deepthroat",
	"handjob",
	"rimming",
	"masturb",
	"(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)s?(um|som|some)",
	"goon",
	"wank",
	"fap",
	"jerk",
	"grind",
	"hump",
	"horny",
	"orgasm",
	"orgi",
	"erotic",
	"nig(ger|ga|a)",
	"chink",
	"fag",
	"wetback",
	"bastard",
	"bitch",
	"pedo",
	"n[iy]mpho",
	"slut",
	"pajeet",
	"gay",
	"lesb(o|ian)",
	"twat",
	"whore",
	"p[or][ro]n",
	"henta[il]",
	"xxx",
	"xvideos",
	"bangbros",
	"xhamster",
	"redtube",
	"spank",
	"strip",
	"bdsm",
	"bbw",
	"deeznut",
	"bendover",
	"911",
	"nine.*eleven",
	// "69", // 69 is harmless...
	"hitler",
	"nazi",
	"epstein",
	"didd[yie]+",
	"kill",
	"bomb",
	"terroris[tm]",
	"suicid(e|al|ing)?",
	"alcohol",
	"vape",
	"cigar",
	"cocain",
	"heroin",
	"weed",
	"marijuana",
	"lsd",
	"ecstasy",
	"methamphetamine",
	"meth",
	"snus",

	// polish offensive words
	"kurwa",
	"pierdol",

	// sinhala offensive words
	"huth?th?[aeio]",
	"ponna",
	"[ck]a?ri(y[ao])?",
	"wes(a|i|ee)",
	"h[iu]ka",
	"p[iu]ka",
	"payi?ya",
	"kimb[aei]",
	"apath?a",
	"awajath?aka",
	"wa?la?th?th?a?",
	"sakkili",
}
var offensiveRegex = buildOffensiveRegex(offensiveWords)

func replaceSimilarCharacters(phrase string) string {
	for k, v := range similarCharacters {
		phrase = strings.ReplaceAll(phrase, k, v)
	}
	return phrase
}

func buildOffensiveRegex(words []string) *regexp.Regexp {
	pattern := "(?i)(" + strings.Join(words, "|") + ")"
	return regexp.MustCompile(pattern)
}

func IsOffensive(phrase string) bool {
	if offensiveRegex.MatchString(phrase) {
		return true
	}
	for range 2 {
		phrase = replaceSimilarCharacters(phrase)
		if offensiveRegex.MatchString(phrase) {
			return true
		}
	}

	return false
}
