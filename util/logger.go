package util

import (
	"github.com/Sirupsen/logrus"
)

var log = logrus.New()

// InitLogger Initialize a logger
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

// GetLogger Return a reference of the logger
func GetLogger() *logrus.Logger {
	return log
}
