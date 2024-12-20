# frozen_string_literal: true

require_relative "lib/jekyll-manager/version"

Gem::Specification.new do |spec|
  spec.name          = "jekyll-manager"
  spec.version       = JekyllManager::VERSION
  spec.authors       = ["Ashwin Maroli"]
  spec.email         = ["ashmaroli@gmail.com"]
  spec.summary       = "Jekyll Admin repackaged with some alterations"
  spec.description   = "An administrative framework for Jekyll sites, Jekyll Manager " \
                       "is essentially Jekyll Admin repackaged with some alterations."
  spec.homepage      = "https://github.com/ashmaroli/jekyll-manager"
  spec.license       = "MIT"
  spec.files         = Dir.glob("lib/**/*").concat(%w(LICENSE README.md))
  spec.require_paths = ["lib"]

  spec.required_ruby_version = ">= 2.7.0"

  spec.add_runtime_dependency "jekyll", ">= 3.7", "< 5.0"
  spec.add_runtime_dependency "oj", "~> 3.12"
  spec.add_runtime_dependency "rackup", "~> 2.0"
  spec.add_runtime_dependency "sinatra", "~> 4.0"
  spec.add_runtime_dependency "sinatra-contrib", "~> 4.0"
  spec.add_runtime_dependency "webrick", "~> 1.7"
end
