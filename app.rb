# encoding: utf-8
require 'rubygems'
require 'bundler'
Bundler.require

require 'sinatra'
require 'sinatra/base'
require 'sinatra/assetpack'
require 'slim'
require 'sass'
require 'mongoid'
require 'json'

enable :sessions

env = ENV['RACK_ENV'] || :development
Mongoid.load!("config/mongoid.yml", env)

# Asset Pack.
register Sinatra::AssetPack

assets do
  serve '/javascripts', from: 'public/javascripts'       # Default
  serve '/stylesheets', from: 'public/stylesheets'       # Default
  serve '/images',      from: 'public/images'            # Default

  # The second parameter defines where the compressed version will be served.
  # (Note: that parameter is optional, AssetPack will figure it out.)
  js :application, '/javascripts/application.js', [
    '/javascripts/*.js'
  ]

  css :application, '/css/application.css', [
    '/stylesheets/*.css',
    '/stylesheets/*.scss'
  ]

  js_compression  :jsmin    # :jsmin | :yui | :closure | :uglify
  css_compression :simple   # :simple | :sass | :yui | :sqwish
end

require './config/weibo'
require './models/user'
require './routes'
require './helpers'
