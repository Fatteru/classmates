# encoding: utf-8
require 'rubygems'
require 'bundler'
Bundler.require

require 'sinatra'
require 'sinatra/assetpack'
require 'slim'
# require 'sass'
require 'mongoid'
require 'json'

# set :environment, :production
enable :sessions

env = ENV['RACK_ENV'] || :development
Mongoid.load!("config/mongoid.yml", env)

# Asset Pack.
register Sinatra::AssetPack

assets do
  serve '/javascripts', from: 'public/javascripts'
  serve '/stylesheets', from: 'public/stylesheets'
  serve '/images',      from: 'public/images'

  js :application, [
    '/javascripts/jquery-1.9.1.min.js',
    '/javascripts/bootstrap.min.js',
    '/javascripts/classmates.js',
    '/javascripts/tdt.js'
  ]

  css :application, [
    '/stylesheets/bootstrap.min.css',
    '/stylesheets/classmates.css'
  ]

  js_compression  :jsmin
  css_compression :simple
end

require './config/weibo'
require './models/user'
require './routes'
require './helpers'
