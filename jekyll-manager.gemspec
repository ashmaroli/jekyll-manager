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

  spec.required_ruby_version = ">= 2.5.0"

  spec.add_runtime_dependency "jekyll", ">= 3.7", "< 5.0"
  spec.add_runtime_dependency "oj", "~> 3.12"
  spec.add_runtime_dependency "sinatra", "~> 1.4"
  spec.add_runtime_dependency "sinatra-contrib", "~> 1.4"
  spec.add_runtime_dependency "webrick", "~> 1.7"

  spec.add_development_dependency "bundler", ">= 1.7"
  spec.add_development_dependency "gem-release", "~> 0.7"
  spec.add_development_dependency "rake", ">= 12.0"
  spec.add_development_dependency "rspec", "~> 3.4"
  spec.add_development_dependency "rubocop-jekyll", "~> 0.12.0"
  spec.add_development_dependency "sinatra-cross_origin", "~> 0.3"
end
