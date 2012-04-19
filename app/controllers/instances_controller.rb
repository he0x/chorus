class InstancesController < ApplicationController
  def index
    instances = Instance.all
    present instances
  end

  def create
    instance = current_user.instances.create!(params[:instance])
    present instance, :status => :created
  end

  def update
    instance = Instance.find_by_id(params[:id])
    if current_user.admin? || current_user == instance.owner
      instance.attributes = params[:instance]
      instance.save!
      present instance
    else
      render :status => :unauthorized, :json => nil
    end
  end
end
