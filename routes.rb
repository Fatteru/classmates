# -*- coding: utf-8 -*-
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

get '/u/all' do
  content_type :json
  @user = User.each()
  @user.to_json
end

get '/u/:uid' do
  content_type :json
  client = WeiboOAuth2::Client.new
  token = client.get_token_from_hash({:access_token => session[:access_token], :expires_at => session[:expires_at]})

  @user = client.users.show_by_uid(params[:uid])
  @user.to_json
end
