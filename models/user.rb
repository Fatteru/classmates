class User
    include Mongoid::Document

    field :uid, type: Integer
    field :screen_name, type: String
end
