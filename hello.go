package main

import (
	"html/template"
	"net/http"
	"os"
)

var tpl = template.Must(template.ParseFiles("index.html"))

func indexHandler(w http.ResponseWriter, r *http.Request) {
	tpl.Execute(w, nil)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	/* reqBody, err := json.Marshal(map[string]string{
		"login":    "rkamalakaran.ext@objenious.com",
		"password": "Michael1508",
	})
	if err != nil {
		print(err)
	}

	resp, err := http.Post("https://api-preprod.objenious.com/v2/login",
		"application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		print(err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)

	type Key struct {
		Token string
	}

	var token Key
	erre := json.Unmarshal(body, &token)
	if erre != nil {
		fmt.Println(erre)
	}

	tokenKey := strings.Replace(token.Token, "{", "", -1)

	tenantList, err := http.Get("http://api.objenious.com/v2/user/profile")
	tenantList.Header.Set("x-token", tokenKey)
	fmt.Println(tenantList)

	if err != nil {
		print(err)
	}

	defer tenantList.Body.Close()
	bodyTenant, err := ioutil.ReadAll(tenantList.Body)
	if err != nil {
		print(err)
	}
	fmt.Print(string(bodyTenant)) */

	fileServer := http.FileServer(http.Dir("./ui/static/"))

	mux := http.NewServeMux()

	mux.Handle("/static/", http.StripPrefix("/static", fileServer))
	mux.HandleFunc("/", indexHandler)

	http.ListenAndServe(":"+port, mux)

	// mux.HandleFunc("/", indexHandler)
}
