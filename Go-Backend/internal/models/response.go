package models

type ResponseStruct struct {
	StatusCode int         `json:"statusCode"`
	Message    string      `json:"message"`
	Error      string      `json:"error,omitempty"`
	Data       interface{} `json:"data,omitempty"`
}