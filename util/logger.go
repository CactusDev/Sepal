package util

import (
	"github.com/Sirupsen/logrus"
)

var log = logrus.New()

func InitLogger(debug bool) *logrus.Logger {
	log.Formatter = new(logrus.TextFormatter)
	if debug {
		log.Level = logrus.DebugLevel
	} else {
		log.Level = logrus.InfoLevel
	}
	log.Info("Logger initialized.")

	return log
}

func GetLogger() *logrus.Logger {
	return log
}
