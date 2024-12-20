# frozen_string_literal: true

source "https://rubygems.org"

# Specify your gem's dependencies in jekyll-manager.gemspec
gemspec

# To allow testing with specific Jekyll versions
gem "jekyll", ENV["JEKYLL_VERSION"] if ENV["JEKYLL_VERSION"]
gem "kramdown-parser-gfm" if ENV["JEKYLL_VERSION"] == "~> 3.9"

# Site dependencies
gem "jekyll-seo-tag"
gem "jekyll-sitemap"

gem "rack-test"
gem "rspec"
gem "rubocop-jekyll", "~> 0.14"
gem "sinatra-cross_origin", "~> 0.3"

# theme
gem "test-theme", :path => "spec/fixtures/test-theme"
