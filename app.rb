# encoding: utf-8
require 'rubygems'
require 'bundler'
Bundler.require

require 'sinatra'
require 'slim'
require 'sass'
require 'mongoid'
require 'json'

require './models/user'

enable :sessions

WeiboOAuth2::Config.api_key = '1248800849'
WeiboOAuth2::Config.api_secret = '149fbf28e07c284954a2a3253466e8fd'
WeiboOAuth2::Config.redirect_uri = 'http://classmates.pinebriety.com/callback'

env = ENV['RACK_ENV'] || :development
Mongoid.load!("config/mongoid.yml", env)

get '/' do
  client = WeiboOAuth2::Client.new
  if session[:access_token] && !client.authorized?
    token = client.get_token_from_hash({:access_token => session[:access_token], :expires_at => session[:expires_at]})
    p "*" * 80 + "validated"
    p token.inspect
    p token.validated?

    unless token.validated?
      reset_session
      redirect '/signin'
      return
    end
  end
  if session[:uid]
    @user = client.users.show_by_uid(session[:uid])
    @statuses = client.statuses
  end

  slim :index
end

get '/signin' do
  client = WeiboOAuth2::Client.new
  redirect client.authorize_url
end

get '/signout' do
  reset_session
  redirect '/'
end

get '/callback' do
  client = WeiboOAuth2::Client.new
  access_token = client.auth_code.get_token(params[:code].to_s)
  session[:uid] = access_token.params["uid"]
  session[:access_token] = access_token.token
  session[:expires_at] = access_token.expires_at
  p "*" * 80 + "callback"
  p access_token.inspect
  @user = client.users.show_by_uid(session[:uid].to_i)
  redirect '/'
end

post '/update' do
  client = WeiboOAuth2::Client.new
  client.get_token_from_hash({:access_token => session[:access_token], :expires_at => session[:expires_at]})
  statuses = client.statuses

  unless params[:file] && (pic = params[:file].delete(:tempfile))
    statuses.update(params[:status])
  else
    status = params[:status] || '图片'
    statuses.upload(status, pic, params[:file])
  end

  redirect '/'
end

get '/:user' do
  content_type :json
  @user = User.first()
  @user.to_json
end

get '/stylesheets/application.css' do
  scss :application
end

helpers do
  def reset_session
    session[:uid] = nil
    session[:access_token] = nil
    session[:expires_at] = nil
  end
end
