package comms

import "fmt"

func FailOnError(err error, msg string) error{
	if err != nil {
		panic(fmt.Sprintf("%s: %s", msg, err))
	}
	return err
}